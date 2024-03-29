module Compile exposing (..)

import Dict exposing (Dict)
import List exposing (head, take, drop, map, filter)
import Readfile exposing (Tree(..), TreeValue(..), Rule(..), ABop(..))
import Model exposing (..)
import State exposing (..)
import StateUtils exposing (..)
import Utils exposing (replaceSubtree, pickValidBranches, dirToValue, updateCell)
import KeyboardInput exposing (Keypress(..))
import Html exposing (b)
import Result exposing (andThen)

example_tree = Branch Seq [Branch ProcList[
    Branch DeclareChannel [Leaf (Ident "chan")], 
    Branch DeclareChannel [Leaf (Ident "chan2")], 
    Branch DeclareVariable [Leaf (Ident "x")], 
    Branch AssignExpr [Leaf (Ident "x"), Leaf (Num 0)],
    Branch Par [Branch ProcList 
        [Branch While [Leaf (Ident "TRUE"), Branch Out [Leaf (Ident "chan"), Leaf (Num 99)]],
        Branch While [Leaf (Ident "TRUE"), Branch Out [Leaf (Ident "chan2"), Leaf (Num 1)]],
        Branch While [Leaf (Ident "TRUE"), Branch In [Leaf (Ident "chan2"), Leaf (Ident "x")]],
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
                    Nothing -> RunErr "Failed to choose a thread - Number out of bounds"

        [] -> Blocked m

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

        Branch Par xs ->
            case xs of
                [Branch ProcList ys] -> unrolledMe (spawn ys pid aid m)
                [Branch Replicator [v1, e1, e2], proc] ->
                    case (eval e1 state, eval e2 state) of
                        (Ok (Number k), Ok (Number l)) ->
                            if k > l then ranMe m
                            else
                                let
                                    replaceWithNumber n = replaceSubtree v1 (Leaf (Num n)) proc
                                    allReplaced = List.map replaceWithNumber (List.range k l)
                                in
                                    unrolledMe (spawn allReplaced pid aid m)
                        _ -> RunErr "Error evaluating replicator"
                _ -> RunErr "PAR rule must be followed by process list or replicator only"

        Branch Seq xs ->
            case xs of 
                [Branch ProcList []] -> ranMe m
                [Branch ProcList (y::ys)] -> 
                    unrolledMe (spawnAndWait y (Branch Seq [Branch ProcList ys]) pid aid m) 
                [Branch Replicator [v1, e1, e2], proc] -> 
                    case (eval e1 state, eval e2 state) of
                        (Ok (Number k), Ok (Number l)) ->
                            if k > l then ranMe m
                            else 
                                let
                                    nextMe = Branch Seq [Branch Replicator [v1, Leaf (Num (k+1)), Leaf (Num l)], proc]
                                    replicated = replaceSubtree v1 (Leaf (Num k)) proc
                                in
                                    unrolledMe (spawnAndWait replicated nextMe pid aid m)
                        _ -> RunErr "Error evaluating replicator"
                _ -> RunErr "SEQ rule must be followed by process list or replicator only"

        Branch In (chan::var::[]) ->            
            case checkFull state chan of
                Ok True -> receiveOnChan chan var pid m
                Ok False ->
                    case treeToId state chan of
                        Ok chanid ->
                            Blocked (block [{ proc = e, waitCond = FilledChan chanid }] m)
                        Err msg -> RunErr msg
                Err msg -> RunErr ("tried to get input but " ++ msg)

        Branch Out (chan::expr::[]) -> 
            case eval expr state of
                Ok n ->
                    case treeToId state chan of
                        Ok chanid ->
                            if chanid.str == graphicschanname then
                                case updateCell m n chanid of
                                    Ok updatedModel -> ranMe updatedModel
                                    Err msg -> RunErr msg
                            else
                                case checkFull state chan of
                                    Ok True ->
                                        RunErr ("Occam doesn't allow more than one parallel process to output to the same channel")

                                    Ok False ->
                                        let
                                            waiting = { proc = e, waitCond = EmptiedChan chanid }
                                        in
                                            sendOnChan chanid n pid (block [waiting] m)
                                    Err msg -> RunErr ("tried to output to a channel but " ++ msg)
                        Err msg -> RunErr ("tried to output to a channel but " ++ msg)
                Err msg -> RunErr ("tried to output a value but " ++ msg)




        Branch Alt (x::[]) ->
            case x of
                Branch AltList xs ->
                    let
                        enactAlternative a model = case a of 
                            Branch Alternative [Branch Guard (bool::action::[]), proc] ->
                                case action of
                                    Branch In (chan::var::[]) ->
                                        receiveOnChan chan var pid (spawn [proc] pid aid model)
                                    Branch Skip _ -> ranMe (spawn [proc] pid aid model)
                                    _ -> RunErr "Invalid alt guard"
                            _ -> RunErr "Invalid alt branch"
                    in
                        case pickValidBranches xs state of
                            Ok [] -> ranMe m
                            Ok ys -> case takeFulfilled m of
                                (model, Nothing) -> Requesting (requestRandomUpTo (List.length ys) (print ("Requesting random one of "++ (String.fromInt (List.length ys))) model))
                                (model, Just rand) -> case (head (drop rand ys)) of 
                                    Just a -> enactAlternative a model
                                    Nothing -> RunErr ( "randomly picking alt branch failed! I think there are " ++ (String.fromInt (List.length ys)) ++" branches but I got the number " ++ (String.fromInt rand))
                            Err msg -> RunErr msg
                    
                --flatten the alts out first, then filter by guard, then choose one and enact it
                
                _ -> RunErr "ALT must be followed by a list of alternatives"
        
        Branch AssignExpr (id::e1::[]) ->
            case (eval e1 state) of
                Ok v -> case (assignVar state id v) of
                    Ok s -> ranMe (update s m)
                    Err msg -> RunErr msg
                Err msg -> RunErr msg

        Branch While (cond::body::[]) -> 
            case (eval cond state) of
                Ok (Boolval True) -> unrolledMe (spawnAndWait body e.code pid aid m)
                Ok (Boolval False) -> ranMe m
                _ -> RunErr "Condition must evaluate to boolean value"

        Branch Cond (choicelist::[]) ->
            let
                getFirstRestChoices ys = case ys of
                    [] -> Err "No choices left"
                    (z::zs) -> case z of
                        Branch GuardedChoice _ ->
                            Ok (z, zs)
                        Branch Cond [Branch ChoiceList qs] ->
                            getFirstRestChoices qs |> Result.andThen (\(first, rest) -> case rest of 
                                [] -> Ok (first, zs)
                                ps -> Ok (first, (Branch ChoiceList ps)::zs)
                            )
                        _ -> Err "Invalid IF branch"
            in
            case choicelist of
                Branch ChoiceList [] -> ranMe m
                Branch ChoiceList xs -> 
                    case getFirstRestChoices xs of 
                        Ok ((Branch GuardedChoice [cond, proc]), ys) -> case (eval cond state) of 
                            Ok (Boolval True) -> ranMe (spawn [proc] pid aid m)
                            Ok (Boolval False) -> unrolledMe (spawn [Branch Cond [Branch ChoiceList ys]] pid aid m)
                            Ok _ -> RunErr "problem evaluating if condition"
                            Err msg -> RunErr ("Failed to evaluate if condition: " ++ msg)
                        Ok _ -> RunErr "problem evaluating IF"
                        Err msg -> RunErr ("couldn't evaluate IF: " ++ msg)
-- would be better to flatten it once in preprocessing the tree.
                _ -> RunErr "invalid syntax for IF statement"

        Branch DeclareVariable _ -> 
            case declareVar state e.code of
                Ok state2 -> ranMe (update state2 m)
                Err msg -> RunErr msg

        Branch DeclareChannel _ ->
            case (declareChan state e.code) of
                Ok state2 -> ranMe (update state2 m)
                Err msg -> RunErr msg

        Branch Skip [] ->
            ranMe m

        Leaf l -> RunErr "Tried to run variable"
        Branch s _ -> RunErr "Wrong tree structure"

receiveOnChan : Tree -> Tree -> Id -> Model -> Outcome
receiveOnChan chan var pid m = 
    case treeToId m.state chan of
        Ok chanid ->
            case getValueAndEmptyChannel chanid m.state of

                Ok (receivedValue, stateChanEmptied) -> case (assignVar stateChanEmptied var receivedValue) of

                    Ok stateChanEmptiedAssigned -> case receivedValue of

                        Number n -> channelEmptied chanid pid (print ("inputted " ++ String.fromInt n ++ " to " ++ (Result.withDefault "receiveOnChan ERROR" (treeToId stateChanEmptiedAssigned var |> Result.andThen (\id -> Ok id.str)))) 
                            { m | state = stateChanEmptiedAssigned })

                        Any -> RunErr "bug - receiving from an empty channel"
                        _ -> RunErr "input to channel was not a number"

                    Err msg -> RunErr msg

                Err msg -> RunErr msg 
        Err msg -> RunErr msg

sendOnChan : Identifier -> Value -> Id -> Model -> Outcome
sendOnChan chanid val pid m =
    case val of
        Number n ->
            case fillChannel val chanid m.state of

                Ok updatedState -> channelFilled chanid pid (print ("outputted " ++ String.fromInt n ++ " to " ++ chanid.str) (update updatedState m))

                Err msg -> RunErr msg
                
        _ -> RunErr "Channels are integer only at the moment"

channelFilled : Identifier -> Id -> Model -> Outcome
channelFilled chanid pid m =
    let 
        (mayUnblock, stillBlocking) = List.partition (\wp ->
                wp.waitCond == FilledChan chanid
                -- Here's a problem! The wait condition should really have not just the str but the whole identifier.
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
            -- no thread was waiting to receive my value; block

channelEmptied : Identifier -> Id -> Model -> Outcome
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
    case checkFull m.state (Branch Id [(Leaf (Ident displaychanname)), Branch Dimensions []]) of
        Ok True -> 
            case getValueAndEmptyChannel displaychanid m.state of
                Ok (value, newState) ->
                    case value of 
                        Number n -> channelEmptied displaychanid (-1) (update newState (display n m))

                        _ -> RunErr "Invalid output to the display (currently requires a number)"
                Err msg -> RunErr msg
        Ok False -> Ran m []
        Err msg -> RunErr ("tried to check for a message to the display, but " ++ msg)

updateKeyboard : Model -> Outcome
updateKeyboard m = 
    case deqKeypress m of
        Just (dir, m2) -> case checkFull m2.state (Branch Id [(Leaf (Ident keyboardchanname)), Branch Dimensions []]) of
            Ok True -> Ran m []
            Ok False -> sendOnChan keyboardchanid (dirToValue dir) (-2) m2
            Err msg -> RunErr ("tried to update keyboard, but " ++ msg)
        Nothing -> Ran m []

