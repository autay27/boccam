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

type Value = Number Int | Channel String | Process Proc | Boolval Bool

type alias Chan = { inUse: Bool, value: Value, lastUser: Int }

type alias State = Dict String Value

type alias Proc = Tree

type alias WaitingProc = { proc: Proc, waitingFor: WaitCond }

type alias Model = { output: String, running: (List Proc), waiting: (List WaitingProc), state: State }

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
                        let m2 = {  output = m.output,
                                    running = notChosen,
                                    waiting = m.waiting,
                                    state = m.state }
                        in 
                            case step t m2 of
                                Ran s -> Ok s
                                RunErr e -> Err e
                                Blocked b -> Err "Blocking reached top level"
                    Nothing -> Err "Failed to choose a thread"
        [] -> Err "program finished"

step : Proc -> Model -> Outcome String Model WaitCond
step e m = let state = m.state in
    case e of

        Branch Par (x::[]) ->
            case x of
                Branch ProcList ys -> 
                    Ran (spawn ys m)
                _ -> RunErr "PAR rule must be followed by process list only"

        Branch Seq (x::[]) ->
            case x of 
                Branch ProcList (y::ys) -> 
                    case (step y m) of 
                        Ran model -> 
                            if (ys == []) then Ran model
                            else Ran (spawn [Branch Seq [Branch ProcList ys]] model)

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
        
        Branch AssignProc (id::e1::[]) ->
            case (assign state id (Process e1)) of
                Ok s -> Ran (update s m)
                Err msg -> RunErr msg

        Branch While (cond::e1::[]) ->
            case (eval cond state) of
                Ok (Boolval True) -> 
                    let aw = Branch ActiveWhile [cond,e1,e1] in
                        Ran (spawn [aw] m)
                Ok (Boolval False) -> Ran m
                _ -> RunErr "Condition must evaluate to boolean value"
        --in the future, may need to account for if the cond contains an input (check spec for if this is possible)
        
        Branch ActiveWhile (cond::original::e1::[]) ->
            case (step e1 (update m.state freshModel)) of
                Ran model -> case model.running of 
                    [] -> let w = Branch While [cond, original] in
                        Ran (print model.output (spawn [w] m))
                    (y::ys) -> let aw = Branch ActiveWhile [cond, original, Branch Par (y::ys)] in
                        Ran (print model.output (spawn [aw] m))
                    --broken, but I wanted to change it up anyway!
                Blocked wc -> let new = {  proc = e, waitingFor = wc } in
                        Ran (print "while body blocked" (block [new] m))
                RunErr msg -> RunErr msg
        --not very space efficient to store two copies of the code

        Branch DeclareChannel ((Leaf (Ident id))::[]) -> 
            case (assign state (Leaf (Ident id)) (Channel id)) of
                Ok state2 -> Ran ( print ("declared " ++ id) (update state2 m))
                Err msg -> RunErr msg

        Leaf l -> case eval (Leaf l) state of 
            Ok (Process proc) -> step proc m
            _ -> RunErr "Tried to run variable, but it didn't hold a process"
        Branch s _ -> RunErr ("Wrong tree structure")

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
                state = Dict.empty }

print : String -> Model -> Model
print s m = { output = m.output ++ s ++ "\n",
                running = m.running,
                waiting = m.waiting,
                state = m.state }

update : State -> Model -> Model 
update s m = { output = m.output,
                running = m.running,
                waiting = m.waiting,
                state = s }

spawn : (List Proc) -> Model -> Model 
spawn xs m = { output = m.output,
                running = xs ++ m.running,
                waiting = m.waiting,
                state = m.state }

block : (List WaitingProc) -> Model -> Model 
block xs m = { output = m.output,
                running = m.running,
                waiting = xs ++ m.waiting,
                state = m.state }