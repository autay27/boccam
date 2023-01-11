module Compile exposing (..)

import Dict exposing (Dict, empty, insert)
import List exposing (head, take, drop)
import Readfile exposing (Tree(..), TreeValue(..), Rule(..))

--example_tree = Branch Seq [Branch ProcList [Branch Out [Leaf (Ident "chan"), Leaf (Num 0)], Branch Out [Leaf (Ident "chan"), Leaf (Num 1)]]]

example_tree = Branch Seq [Branch ProcList[
    Branch DeclareChannel [Leaf (Ident "chan")], 
    Branch Par [Branch ProcList 
        [Branch While [Leaf (Ident "TRUE"), Branch Out [Leaf (Ident "chan"), Leaf (Num 1)]],
        Branch While [Leaf (Ident "TRUE"), Branch Out [Leaf (Ident "chan"), Leaf (Num 0)]]]]]]

-- simulating program

type WaitCond = PlchldWait

type Outcome a b c = RunErr a | Ran b | Blocked c

type Value = Number Int | Channel String | Boolval Bool

type alias Chan = { inUse: Bool, value: Value, lastUser: Int }

type alias State = Dict String Value

type alias Proc = {code: Tree, id: Int, parentWhileId: Maybe Int}

type alias WaitingProc = { proc: Proc, waitingFor: WaitCond }

type alias Model = { output: String, running: (List Proc), waiting: (List WaitingProc), state: State, ids: Dict Int Bool }

run : Model -> Int -> Result String Model
run m n =
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
                            case step t m2 of
                                Ran s -> Ok s
                                RunErr e -> Err e
                                Blocked b -> Err "Blocking reached top level"
                    Nothing -> Err "Failed to choose a thread"
        [] -> Err "program finished"

step : Proc -> Model -> Outcome String Model WaitCond
step e m = let state = m.state in
    case e.code of

        Branch Par (x::[]) ->
            case x of
                Branch ProcList ys -> 
                    Ran (spawn ys e.parentWhileId m)
                _ -> RunErr "PAR rule must be followed by process list only"

        Branch Seq (x::[]) ->
            case x of 
                Branch ProcList (y::ys) -> 
                    case (toProcStep y e.parentWhileId m) of 
                        Ran model -> 
                            if (ys == []) then Ran model
                            else Ran (spawn [Branch Seq [Branch ProcList ys]] e.parentWhileId model)

                        Blocked wc -> let new = {  proc = e, waitingFor = wc } in                        
                            Ran (block [new] m)

                        RunErr msg -> RunErr msg
                _ -> RunErr "SEQ rule must be followed by process list only"

        Branch Out (x::y::[]) -> 
            case (eval x state) of 
                Ok (Channel c) ->
                    case (eval y state) of
                        Ok (Number n) ->
                            Ran ( print (c ++ " ! " ++ (String.fromInt n)) m)
                        _ -> RunErr "must output number"
                Err msg -> RunErr ("Tried to output but: " ++ msg)
                _ -> RunErr "must output to a channel"

        Branch AssignExpr (id::e1::[]) ->
            case (eval e1 state) of
                Ok v -> 
                    case (assign state id v) of
                        Ok s -> Ran (update s m)
                        Err msg -> RunErr msg
                Err msg -> RunErr msg

        Branch While (cond::e1::[]) -> RunErr "unimplemented while"

        --in the future, may need to account for if the cond contains an input (check spec for if this is possible)
        
        Branch ActiveWhile (cond::original::e1::[]) -> RunErr "activewhile needs to be removed"

        --not very space efficient to store two copies of the code

        Branch DeclareChannel ((Leaf (Ident id))::[]) -> 
            case (assign state (Leaf (Ident id)) (Channel id)) of
                Ok state2 -> Ran ( print ("declared " ++ id) (update state2 m))
                Err msg -> RunErr msg

        Leaf l -> RunErr "Tried to run variable"
        Branch s _ -> RunErr ("Wrong tree structure")

toProcStep : Tree -> Maybe Int -> Model -> Outcome String Model WaitCond
toProcStep t parent m = let (ps, d) = assignIds [t] parent m.ids in 
    case head ps of 
        Just p -> step p { m | ids = d }
        Nothing -> RunErr "failed to convert a tree to a proc in a toProcStep"

eval : Tree -> State -> Result String Value
eval t state =
    case t of
        Leaf (Ident "TRUE") -> Ok (Boolval True)
        --need to put this in an init state
        Leaf (Ident s) -> 
            case Dict.get s state of
                Just v -> Ok v
                Nothing -> Err ("Variable " ++ s ++ " not declared")
        Leaf (Num n) -> Ok (Number n)
        Branch rule children -> Err "eval processing a tree"

assign : State -> Tree -> Value -> Result String State
assign state id v = 
    case id of
        Leaf (Ident str) -> Ok (Dict.insert str v state)
        _ -> Err "tried to assign to a number"

freshModel = { output = "",
                running = [],
                waiting = [],
                state = Dict.empty,
                ids = Dict.empty }

print : String -> Model -> Model
print s m = { m | output = m.output ++ s ++ "\n" }

update : State -> Model -> Model 
update s m = { m | state = s }

spawn : (List Tree) -> Maybe Int -> Model -> Model
spawn xs parent m = let (ys, d) = assignIds xs parent m.ids in 
    basic_spawn ys { m | ids = d }

basic_spawn : (List Proc) -> Model -> Model 
basic_spawn xs m = { m | running = xs ++ m.running }

assignIds : List Tree -> Maybe Int -> Dict Int Bool -> (List Proc, Dict Int Bool)
assignIds trees parent dict = 
        case trees of 
            [] -> ([], dict)
            (t::ts) -> 
                let (xs, d) = assignIds ts parent dict in
                    let (i, dict2) = getNext d in
                        ({code = t, id = i, parentWhileId = parent}::xs, dict2)

getNext : Dict Int Bool -> (Int, Dict Int Bool)
getNext dict = 
    let 
        getNext2 d n = if Dict.member n d then getNext2 d (n+1) else (n, d)
    in
        getNext2 dict 0

block : (List WaitingProc) -> Model -> Model 
block xs m = { m | waiting = xs ++ m.waiting }