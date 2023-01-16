module Compile exposing (..)

import Dict exposing (Dict, insert)
import List exposing (head, take, drop, map, filter)
import Readfile exposing (Tree(..), TreeValue(..), Rule(..))
import Model exposing (..)

example_tree = Branch Seq [Branch ProcList[
    Branch DeclareChannel [Leaf (Ident "chan")], 
    Branch DeclareVariable [Leaf (Ident "x")], 
    Branch Par [Branch ProcList 
        [Branch While [Leaf (Ident "TRUE"), Branch In [Leaf (Ident "chan"), Leaf (Ident "x")]],
        Branch While [Leaf (Ident "TRUE"), Branch Out [Leaf (Ident "chan"), Leaf (Num 0)]]]]]]

-- simulating program

type Outcome a b c d = RunErr a | Ran b | Unrolled c | Blocked d

run m n = let (outcome, id) = (make_step m n) in
    case outcome of
        Ran s -> unblock (s, id)
        Unrolled s -> unblock (s, id) |> Result.andThen (\newm -> run newm n) 
        -- not exactly uniform prob. anymore but it's better
        Blocked s -> Ok (print "something blocked..." s)
        RunErr e -> Err e

make_step : Model -> Int -> (Outcome String Model Model Model, Id)
make_step m n =
    case m.running of
        (x::xs) -> 
            let
                chosen = head (drop n m.running)
                notChosen = (take n m.running) ++ (drop (n+1) m.running)
            in
                case chosen of 
                    Just t ->
                        let m2 = {  m | running = notChosen }
                        in 
                            (step t m2, t.id)
                    Nothing -> (RunErr "Failed to choose a thread", -1)
        [] -> (RunErr "program finished", -1)

unblock : (Model, Id) -> Result String Model
unblock (m, id) = 
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

step : Proc -> Model -> Outcome String Model Model Model
step e m = let state = m.state in
    case e.code of

        Branch Par (x::[]) ->
            case x of
                Branch ProcList ys -> Unrolled (spawn ys e.id e.ancestorId m)
                _ -> RunErr "PAR rule must be followed by process list only"

        Branch Seq (x::[]) ->
            case x of 
                Branch ProcList [] -> Ran m
                Branch ProcList (y::ys) -> 
                    Unrolled (spawnAndWait y (Branch Seq [Branch ProcList ys]) e.id e.ancestorId m)
                _ -> RunErr "SEQ rule must be followed by process list only"

        Branch In (chan::var::[]) ->
            case getName var of 
                Ok varname -> case checkFull state chan of
                        Ok True -> case receiveOnChan chan var m of
                            Ok model -> Ran model
                            Err msg -> RunErr ("tried to read input to variable, but " ++ msg)
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
                            let
                                waiting = { proc = e, waitCond = EmptiedChanToFill id }
                            in
                                Blocked (block [waiting] m)
                        Ok False -> case eval expr state of
                            Ok n ->
                                case sendOnChan chan n m of 
                                    Ok model -> 
                                        let
                                            waiting = { proc = e, waitCond = EmptiedChan id }
                                        in
                                            Blocked (block [waiting] model)
                                    Err msg -> RunErr msg
                            Err msg -> RunErr ("tried to output a value but " ++ msg)
                        Err msg -> RunErr ("tried to output to a channel but " ++ msg)

                Err msg -> RunErr ("tried to output to a channel but " ++ msg)

        Branch AssignExpr (id::e1::[]) ->
            case (eval e1 state) of
                Ok v -> 
                    case getName id of 
                        Ok name -> 
                            case (assignVar state name v) of
                                Ok s -> Ran (update s m)
                                Err msg -> RunErr msg
                        Err msg -> RunErr msg
                Err msg -> RunErr msg

        Branch While (cond::body::[]) -> 
            case (eval cond state) of
                Ok (Boolval True) -> Unrolled (spawnAndWait body e.code e.id e.ancestorId m)
                Ok (Boolval False) -> Ran m
                _ -> RunErr "Condition must evaluate to boolean value"

        --in the future, may need to account for if the cond contains an input (check spec for if this is possible)

        --not very space efficient to store two copies of the code

        Branch DeclareVariable ((Leaf (Ident id))::[]) -> 
            case declareVar state id of
                Ok state2 -> Ran ( print ("declared variable " ++ id) (update state2 m))
                Err msg -> RunErr msg

        Branch DeclareChannel ((Leaf (Ident id))::[]) -> 
            case (declareChan state (Leaf (Ident id))) of
                Ok state2 -> Ran ( print ("declared channel " ++ id) (update state2 m))
                Err msg -> RunErr msg

        Branch Skip [] ->
            Ran m

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

receiveOnChan : Tree -> Tree -> Model -> Result String Model
receiveOnChan chan var m = case chan of 
    Leaf (Ident chanid) -> 
        let 
            state = m.state
        in
            case Dict.get chanid state.chans of
                Just channel ->
                    let
                        receivedValue = channel.value 
                        stateEmptiedChannel = { state | chans = (Dict.insert chanid freshChannel state.chans)}
                    in 
                        case getName var of 
                            Ok varid ->
                                case (assignVar stateEmptiedChannel varid receivedValue) of
                                    Ok state2 -> Ok { m | state = state2 }
                                    Err msg -> Err msg
                            Err msg -> Err msg
                            --yeah, I'll change it to have some Result.andThen stuff later
                Nothing -> Err "could not find the specified channel"
    _ -> Err "invalid channel identifier"

sendOnChan : Tree -> Value -> Model -> Result String Model
sendOnChan chan val m = 
    getName chan |> Result.andThen (\chanid ->
        let 
            state = m.state
            filledchan = { isFull = True, value = val }
            updatedState = { state | chans = Dict.insert chanid filledchan state.chans }
        in
            Ok { m | state = updatedState }
    )
-- Requires integer value or Any for now!