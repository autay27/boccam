module Compile exposing (..)

import Dict exposing (Dict)
import List exposing (head, take, drop, map, filter)
import Readfile exposing (Tree(..), TreeValue(..), Rule(..), ABop(..))
import Model exposing (..)
import State exposing (..)
import Eval exposing (eval)
import KeyboardInput exposing (Direction(..))
import Html exposing (b)

example_tree = Branch Seq [Branch ProcList[
    Branch DeclareChannel [Leaf (Ident "chan")], 
    Branch DeclareVariable [Leaf (Ident "x")], 
    Branch AssignExpr [Leaf (Ident "x"), Leaf (Num 0)],
    Branch Par [Branch ProcList 
        [Branch While [Leaf (Ident "TRUE"), Branch Out [Leaf (Ident "chan"), Branch (ABinop Plus) [Leaf (Ident "x"), Leaf (Num 1)]]],
        Branch While [Leaf (Ident "TRUE"), Branch In [Leaf (Ident "chan"), Leaf (Ident "x")]]]
    ]]]

-- simulating program

type Outcome = RunErr String | Ran Model (List Id) | Unrolled Model Id | Blocked Model | Requesting Model

run : Model -> Int -> Result String Model
run m n =
    case make_step m n of
        Ran model ids -> 
            case updateIO model of
                Ran model2 ids2 -> unblock model2 (ids++ids2)
                RunErr msg -> Err msg
                _ -> Err "unexpected result from IO"
        Unrolled model id -> unblock model [id] |> Result.andThen (\newm -> run newm n) 
        -- not exactly uniform prob. anymore but it's better
        Blocked model -> 
            case updateIO model of
                Ran model2 ids2 -> unblock model2 ids2
                RunErr msg -> Err msg
                _ -> Err "unexpected result from IO"
        Requesting model -> Ok model
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

        [] -> Blocked (print "blocking..." m)

unblock : Model -> List Id -> Result String Model
unblock model ids = 
    let 
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
                --Ok (print ("terminated " ++ String.fromInt id) (basic_spawn unblockedProcs { m | waiting = stillWaiting }))
    in
        case ids of
            [] -> Ok model 
            (x::xs) -> unblock_once model x |> Result.andThen (\newm -> unblock newm xs)

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
            case getName chan of
                Ok chanid -> 
                    case checkFull state chan of
                        Ok True -> receiveOnChan chanid var pid m
                        Ok False -> Blocked (block [{ proc = e, waitCond = FilledChan chanid }] m)
                        Err msg -> RunErr ("tried to get input but " ++ msg)
                Err msg -> RunErr "invalid channel name"

        Branch Out (chan::expr::[]) -> 
            case getName chan of
                Ok chanid -> 
                    case checkFull state chan of
                        Ok True -> 
                            RunErr ("Occam doesn't allow more than one parallel process to output to the same channel")

                        Ok False -> 
                            case eval expr state of
                                Ok n -> 
                                    let
                                        waiting = { proc = e, waitCond = EmptiedChan chanid }
                                    in
                                        sendOnChan chanid n pid (block [waiting] m)

                                Err msg -> RunErr ("tried to output a value but " ++ msg)

                        Err msg -> RunErr ("tried to output to a channel but " ++ msg)

                Err msg -> RunErr ("invalid channel name")

        Branch Alt (x::[]) ->
            case x of
                Branch AltList xs ->
                    let
                        enactAlternative a = case a of 
                            Branch Alternative [Branch Guard (bool::(Branch In (chan::var::[]))::[]), proc] ->
                                case getName chan of 
                                    Ok chanid -> receiveOnChan chanid var pid (spawn [proc] pid aid m)
                                    _ -> RunErr "Invalid channel name in alt branch"
                            _ -> RunErr "Invalid alt branch"
                    in
                        case pickValidBranches xs state of
                            Ok [] -> ranMe m
                            Ok ys -> case m.randomGenerator.fulfilment of
                                Nothing -> Requesting (requestRandomUpTo (List.length ys) m)
                                Just rand -> case (head (drop rand ys)) of 
                                    Just a -> enactAlternative a 
                                    Nothing -> RunErr "randomly picking alt branch failed!"
                            Err msg -> RunErr msg
                    
                --flatten the alts out first, then filter by guard, then choose one and enact it
                
                _ -> RunErr "ALT must be followed by a list of alternatives"
        
        Branch AssignExpr (id::e1::[]) ->
            case checkDeclared id state of
                Ok () ->
                    case (eval e1 state) of
                        Ok v -> case (assignVar state id v) of
                            Ok s -> ranMe (update s m)
                            Err msg -> RunErr msg
                        Err msg -> RunErr msg
                Err msg -> RunErr ("Tried to assign to variable, but " ++ msg)

        Branch While (cond::body::[]) -> 
            case (eval cond state) of
                Ok (Boolval True) -> unrolledMe (spawnAndWait body e.code pid aid m)
                Ok (Boolval False) -> ranMe m
                _ -> RunErr "Condition must evaluate to boolean value"

        Branch DeclareVariable (id::[]) -> 
            case declareVar state id of
                Ok state2 -> ranMe (update state2 m)
                Err msg -> RunErr msg

        Branch DeclareChannel (id::[]) -> 
            case (declareChan state  id) of
                Ok state2 -> ranMe (update state2 m)
                Err msg -> RunErr msg

        Branch Skip [] ->
            ranMe m

        Leaf l -> RunErr "Tried to run variable"
        Branch s _ -> RunErr "Wrong tree structure"

pickValidBranches : List Tree -> State -> Result String (List Tree)
pickValidBranches alts state = 
    let 
        flattenAlt ys = case ys of 
            [] -> Ok []
            (z::zs) -> case z of 
                Branch Guard _ -> 
                    flattenAlt zs |> Result.andThen (\therest -> 
                        Ok (z::therest)
                    )
                Branch Alt [Branch AltList qs] -> 
                    flattenAlt qs |> Result.andThen (\flattened -> 
                        flattenAlt zs |> Result.andThen (\therest -> 
                            Ok (flattened ++ therest)
                        ))
                _ -> Err "Invalid ALT branch"
        filterByGuard ys = case ys of
            [] -> Ok []
            (x::xs) -> filterByGuard xs |> Result.andThen (\therest ->
                case x of 
                    Branch Alternative [Branch Guard (bool::input::[]), proc] ->
                        case eval bool state of 
                            Ok (Boolval True) -> case input of         
                                Branch In (chan::var::[]) ->
                                    checkFull state chan |> Result.andThen (\f -> 
                                        if f then Ok (x::therest) else Ok therest
                                    )
                                _ -> Err "unexpected channel in alternative branch"
                            Ok (Boolval False) -> Ok therest
                            Ok _ -> Err "Expression in front of a guard on an alt branch must be boolean"
                            Err msg -> Err msg
                    _ -> Err "Unexpected branch in alternative"
                )
    in
        flattenAlt alts |> Result.andThen filterByGuard


receiveOnChan : String -> Tree -> Id -> Model -> Outcome
receiveOnChan chanid var pid m = 
    case getFromChannel chanid m.state of

        Ok (stateChanEmptied, receivedValue) -> case (assignVar stateChanEmptied var receivedValue) of

            Ok stateChanEmptiedAssigned -> case receivedValue of

                Number n -> channelEmptied chanid pid (print ("inputted " ++ String.fromInt n ++ " to " ++ (Result.withDefault "receiveOnChan ERROR" (getName var))) 
                    { m | state = stateChanEmptiedAssigned })

                _ -> RunErr "unexpected, input was not a number"

            Err msg -> RunErr msg

        Err msg -> RunErr msg 


getFromChannel : String -> State -> Result String (State, Value)
getFromChannel chanid state =
    case Dict.get chanid state.chans of
        Just channel ->
            let
                foundValue = channel.value 
                stateChanEmptied = { state | chans = (Dict.insert chanid freshChannel state.chans)}
            in 
                Ok (stateChanEmptied, foundValue)
        Nothing -> Err "could not find the specified channel"


sendOnChan : String -> Value -> Id -> Model -> Outcome
sendOnChan chanid val pid m =
    case val of
        Number n ->
            let 
                state = m.state
                filledchan = { isFull = True, value = val }
                updatedState = { state | chans = Dict.insert chanid filledchan state.chans }
            in
                channelFilled chanid pid (print ("outputted " ++ String.fromInt n ++ " to " ++ chanid) (update updatedState m))


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
                        case getName chan2 of
                            Ok chanid2 ->
                                case receiveOnChan chanid2 var unblocking.proc.id { m | waiting = notUnblocking ++ stillBlocking } of
                                    Ran model xs -> Ran model xs
                                    other -> other
                            Err msg -> RunErr "unblocking process channel had a funny name, following a channel being filled"

                    _ -> RunErr "unexpected process unblocking following a channel being filled"

            [] -> Blocked m
            -- no thread was waiting to receive my value; block

channelEmptied : String -> Id -> Model -> Outcome
channelEmptied chanid pid m =
    let
        (mayUnblock, stillBlocking) = List.partition (\wp ->
                wp.waitCond == EmptiedChan chanid
            ) m.waiting
    in
        case mayUnblock of 
            (unblocking::notUnblocking) -> 
                case unblocking.proc.code of 
                    Branch Out _ -> 
                        Ran { m | waiting = notUnblocking ++ stillBlocking } [unblocking.proc.id, pid]

                    _ -> RunErr "unexpected process unblocking following a channel being emptied"

            [] -> Ran m [pid]
            -- no thread was waiting to give me a value; block

updateIO : Model -> Outcome
updateIO model = chainRun model updateDisplay updateKeyboard

chainRun : Model -> (Model -> Outcome) -> (Model -> Outcome) -> Outcome
chainRun model f g =
    case f model of 
        Ran m xs -> case g m of
            Ran m2 ys -> Ran m2 (xs++ys)
            Blocked m2 -> Ran m2 xs
            RunErr msg -> RunErr msg
            _ -> RunErr "unexpected chainrun"
        Blocked m -> case g m of
            Ran m2 ys -> Ran m2 (ys)
            Blocked m2 -> Blocked m2
            RunErr msg -> RunErr msg
            _ -> RunErr "unexpected chainrun"
        RunErr msg -> RunErr msg
        _ -> RunErr "unexpected chainrun"--?? I think this shows a fundamental issue with Outcome but I'm not touching it rn

updateDisplay : Model -> Outcome
updateDisplay m = 
    case checkFull m.state (Leaf (Ident displaychanname)) of
        Ok True -> 
            case getFromChannel displaychanname m.state of
                Ok (newState, value) ->
                    case value of 
                        Number n -> channelEmptied displaychanname (-1) (update newState (display (String.fromInt n) m))

                        _ -> RunErr "Invalid output to the display (currently requires a number)"
                Err msg -> RunErr msg
        Ok False -> Ran m []
        Err msg -> RunErr ("tried to check for a message to the display, but " ++ msg)

updateKeyboard : Model -> Outcome
updateKeyboard m = 
    case deqKeypress m of
        Just (dir, m2) -> case checkFull m2.state (Leaf (Ident keyboardchanname)) of 
            Ok True -> Ran m []
            Ok False -> sendOnChan keyboardchanname (dirToValue dir) (-2) m2
            Err msg -> RunErr ("tried to update keyboard, but " ++ msg)
        Nothing -> Ran m []

dirToValue : Direction -> Value
dirToValue dir =
    case dir of
        Left -> Number 0
        Right -> Number 1
        Other -> Number 2

pretend_im_random : Int
pretend_im_random = 0