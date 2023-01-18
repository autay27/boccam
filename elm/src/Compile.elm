module Compile exposing (..)

import Dict exposing (Dict, insert)
import List exposing (head, take, drop, map, filter)
import Readfile exposing (Tree(..), TreeValue(..), Rule(..))
import Model exposing (..)

example_tree = Branch Seq [Branch ProcList[
    Branch DeclareChannel [Leaf (Ident "chan")], 
    Branch DeclareVariable [Leaf (Ident "x")], 
    Branch Par [Branch ProcList 
        [Branch While [Leaf (Ident "TRUE"), Branch Out [Leaf (Ident "chan"), Leaf (Num 0)]],
        Branch While [Leaf (Ident "TRUE"), Branch In [Leaf (Ident "chan"), Leaf (Ident "x")]]]
    ]]]

-- simulating program

type Outcome = RunErr String | Ran Model (List Id) | Unrolled Model Id | Blocked Model

run : Model -> Int -> Result String Model
run m n =
    case make_step m n of
        Ran model ids -> unblock model ids
        Unrolled model id -> unblock model [id] |> Result.andThen (\newm -> run newm n) 
        -- not exactly uniform prob. anymore but it's better
        Blocked model -> Ok model
        RunErr msg -> Err msg

make_step : Model -> Int -> Outcome
make_step m n =
    case m.running of
        (x::xs) -> 
            let
                chosen = head (drop n m.running)
                notChosen = (take n m.running) ++ (drop (n+1) m.running)
            in
                case chosen of 
                    Just t -> let m2 = {  m | running = notChosen } in 
                        step t m2
                    Nothing -> RunErr "Failed to choose a thread"
        [] -> RunErr "program finished"

unblock : Model -> List Id -> Result String Model
unblock m ids = 
    case ids of
        [] -> Ok m 
        (x::xs) -> unblock_once m x |> Result.andThen (\newm -> unblock newm xs)

unblock_once : Model -> Id -> Result String Model
unblock_once m id = 
    let
        updatedAfterTermination = map (\p -> case p.waitCond of
            Terminated xs -> { p | waitCond = Terminated (filter (\x -> x /= id) xs) }
            _ -> p
            ) m.waiting
        (unblocked, stillWaiting) = List.partition (\p -> p.waitCond == Terminated []) updatedAfterTermination
        unblockedProcs = map (\p -> p.proc) unblocked
    in
        Ok (basic_spawn unblockedProcs { m | waiting = stillWaiting })

-- we can also remove i from m.ids here

step : Proc -> Model -> Outcome
step e m = 
    let 
        state = m.state
        pid = e.id
        aid = e.ancestorId
        ranMe model = Ran model [pid] 
        unrolledMe model = Unrolled model pid
    in case e.code of

        Branch Par (x::[]) ->
            case x of
                Branch ProcList ys -> unrolledMe (spawn ys pid aid m) 
                _ -> RunErr "PAR rule must be followed by process list only"

        Branch Seq (x::[]) ->
            case x of 
                Branch ProcList [] -> ranMe m
                Branch ProcList (y::ys) -> 
                    unrolledMe (spawnAndWait y (Branch Seq [Branch ProcList ys]) pid aid m) 
                _ -> RunErr "SEQ rule must be followed by process list only"

        Branch In (chan::var::[]) ->
            case getName var of 
                Ok varname -> case checkFull state chan of
                        Ok True -> receiveOnChan chan var pid m
                        Ok False -> case getName chan of
                            Ok name -> Blocked (block [{ proc = e, waitCond = FilledChan name }] m)
                            Err msg -> RunErr ("tried to get input but " ++ msg)
                        Err msg -> RunErr ("tried to get input but " ++ msg)
                Err msg -> RunErr "Invalid variable name for an input"

        Branch Out (chan::expr::[]) -> 
            case getName chan of
                Ok id -> 
                    case checkFull state chan of
                        Ok True -> 
                            RunErr ("Occam doesn't allow more than one parallel process to output to the same channel")

                        Ok False -> 
                            case eval expr state of
                                Ok n -> 
                                    let
                                        waiting = { proc = e, waitCond = EmptiedChan id }
                                    in
                                        sendOnChan chan n pid (block [waiting] m)

                                Err msg -> RunErr ("tried to output a value but " ++ msg)

                        Err msg -> RunErr ("tried to output to a channel but " ++ msg)

                Err msg -> RunErr ("invalid channel name")

        Branch AssignExpr (id::e1::[]) ->
            case (eval e1 state) of
                Ok v -> 
                    case getName id of 
                        Ok name -> 
                            case (assignVar state name v) of
                                Ok s -> ranMe (update s m)
                                Err msg -> RunErr msg
                        Err msg -> RunErr msg
                Err msg -> RunErr msg

        Branch While (cond::body::[]) -> 
            case (eval cond state) of
                Ok (Boolval True) -> unrolledMe (spawnAndWait body e.code pid aid m)
                Ok (Boolval False) -> ranMe m
                _ -> RunErr "Condition must evaluate to boolean value"

        --in the future, may need to account for if the cond contains an input (check spec for if this is possible)

        --not very space efficient to store two copies of the code

        Branch DeclareVariable ((Leaf (Ident id))::[]) -> 
            case declareVar state id of
                Ok state2 -> ranMe ( print ("declared variable " ++ id) (update state2 m))
                Err msg -> RunErr msg

        Branch DeclareChannel ((Leaf (Ident id))::[]) -> 
            case (declareChan state (Leaf (Ident id))) of
                Ok state2 -> ranMe ( print ("declared channel " ++ id) (update state2 m))
                Err msg -> RunErr msg

        Branch Skip [] ->
            ranMe m

        Leaf l -> RunErr "Tried to run variable"
        Branch s _ -> RunErr ("Wrong tree structure")

eval : Tree -> State -> Result String Value
eval t state =
    case t of
        Leaf (Ident "TRUE") -> Ok (Boolval True)
        --need to put this in an init state
        Leaf (Ident s) -> 
            case Dict.get s state.vars of
                Just v -> Ok v
                Nothing -> Err ("Variable " ++ s ++ " not declared")
        Leaf (Num n) -> Ok (Number n)
        Branch rule children -> Err "eval processing a tree"

getName : Tree -> Result String String
getName tree = case tree of
    Leaf (Ident str) -> Ok str
    _ -> Err "Invalid name for a variable or channel"

checkFull : State -> Tree -> Result String Bool
checkFull state id = 
    case id of
        Leaf (Ident str) -> case Dict.get str state.chans of
            Just ch ->  Ok ch.isFull
            Nothing -> Err "channel not declared"
        _ -> Err "not a channel"
        
assignVar : State -> String -> Value -> Result String State
assignVar state id v = 
    if Dict.member id state.chans then 
        Err "tried to assign to a channel" 
    else 
        Ok {state | vars = (Dict.insert id v state.vars)}

declareVar : State -> String -> Result String State
declareVar state id = 
    if Dict.member id state.vars then 
        Err "declared a variable that already exists"
    else
        assignVar state id Any

declareChan : State -> Tree -> Result String State
declareChan state t = 
    case t of
        Leaf (Ident id) -> 
            if Dict.member id state.vars then 
                    Err "tried to declare a channel with a variable's name" 
                else if Dict.member id state.chans then 
                        Err "channel already declared"
                    else 
                        Ok {state | chans = (Dict.insert id freshChannel state.chans)}
        _ -> Err "tried to declare, but name was a number"

receiveOnChan : Tree -> Tree -> Id -> Model -> Outcome
receiveOnChan chan var pid m = case chan of 
    Leaf (Ident chanid) -> 
        let state = m.state in
            case Dict.get chanid state.chans of
                Just channel ->
                    let
                        receivedValue = channel.value 
                        stateEmptiedChannel = { state | chans = (Dict.insert chanid freshChannel state.chans)}
                    in 
                        case getName var of 
                            Ok varid ->
                                case (assignVar stateEmptiedChannel varid receivedValue) of
                                    Ok stateEmptiedAssigned -> case receivedValue of
                                        Number n -> channelEmptied chanid pid (print ("inputted " ++ String.fromInt n ++ " to " ++ varid) { m | state = stateEmptiedAssigned })
                                        _ -> RunErr "unexpected, input was not a number"
                                    Err msg -> RunErr msg
                            Err msg -> RunErr msg
                Nothing -> RunErr "could not find the specified channel"
    _ -> RunErr "invalid channel identifier"

sendOnChan : Tree -> Value -> Id -> Model -> Outcome
sendOnChan chan val pid m =
    case val of
        Number n ->
            case getName chan of
                Ok chanid ->
                    let 
                        state = m.state
                        filledchan = { isFull = True, value = val }
                        updatedState = { state | chans = Dict.insert chanid filledchan state.chans }
                    in
                        channelFilled chanid pid (print ("outputted " ++ String.fromInt n ++ " to " ++ chanid) { m | state = updatedState })
                Err msg -> RunErr "Invalid channel name"
        _ -> RunErr "Channels are integer only at the moment"

channelFilled : String -> Id -> Model -> Outcome
channelFilled chan pid m =
    let 
        (mayUnblock, stillBlocking) = List.partition (\wp ->
                wp.waitCond == FilledChan chan
            ) m.waiting
    in
        case mayUnblock of 
            (unblocking::notUnblocking) -> 
                case unblocking.proc.code of 
                    Branch In (chan2::var::[]) -> 
                        case receiveOnChan chan2 var unblocking.proc.id { m | waiting = notUnblocking ++ stillBlocking } of
                            Ran model xs -> Ran model xs
                            other -> other
                    _ -> RunErr "unexpected process unblocking following a channel being filled"
            [] -> Blocked m

channelEmptied : String -> Id -> Model -> Outcome
channelEmptied chan pid m =
    let
        (mayUnblock, stillBlocking) = List.partition (\wp ->
                wp.waitCond == EmptiedChan chan
            ) m.waiting
    in
        case mayUnblock of 
            (unblocking::notUnblocking) -> 
                case unblocking.proc.code of 
                    Branch Out _ -> 
                        Ran { m | waiting = notUnblocking ++ stillBlocking } [unblocking.proc.id, pid]
                    _ -> RunErr "unexpected process unblocking following a channel being emptied"
            [] -> Ran m [pid]