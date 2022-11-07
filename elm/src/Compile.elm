module Compile exposing (..)

import Dict exposing (Dict, empty, insert)

type TreeValue = Num Int | Ident String

type Tree = Leaf TreeValue | Branch String (List Tree)

example_tree = Branch "seq" [Branch "proc_list" [Branch "out" [Leaf (Ident "chan"), Leaf (Num 0)], 
                                                Branch "out" [Leaf (Ident "chan"), Leaf (Num 1)]]]

-- simulating program

--Could have a counter for the sequential block - which line comes next. solves the blocking problem too.
--aim to give all 'threads' equal expected time - Not dpeendnet on how deep in the trre it is

type WaitCond = PlchldWait

type Outcome a b c = RunErr a | Ran b | Blocked c

type Value = Number Int | Channel String | Process Proc

type alias Chan = { inUse: Bool, value: Value, lastUser: Int }

type alias State = Dict String Value

type alias Proc = Tree

type alias WaitingProc = { proc: Proc, waitingFor: WaitCond }

type alias Model = { output: String, running: (List Proc), waiting: (List WaitingProc), state: State }

run : Model -> Result String Model
run m =
    case m.running of
        (x::xs) ->
            --we won't do it randomly for now
            case step x m.output xs m.waiting m.state of
                Ran s -> Ok s
                RunErr e -> Err e
                Blocked b -> Err "Blocking reached top level"
        [] -> Err "program finished"

step : Proc -> String -> (List Proc) -> (List WaitingProc) -> State -> Outcome String Model WaitCond
step e out rs ws state =
    case e of

        Branch "par" (x::[]) ->
            case x of
                Branch "proc_list" ys -> 
                    case run { output = out,
                                running = (rs ++ ys), 
                                waiting = ws, 
                                state = state} of
                        Ok model -> Ran model
                        Err msg -> RunErr msg
                _ -> RunErr "PAR rule must be followed by process list only"

        Branch "seq" (x::[]) ->
            case x of 
                Branch "proc_list" (y::ys) -> 
                    case (step y out rs ws state) of 
                        Ran model -> if (ys == []) then 
                                        Ran model
                                    else
                                        Ran { output = model.output,
                                        running = [Branch "seq" [Branch "proc_list" ys]] ++ model.running,
                                        waiting = model.waiting,
                                        state = model.state }
                        Blocked wc ->  let 
                                            new = {  proc = e, waitingFor = wc }
                                        in                        
                                            Ran { output = out,
                                            running = rs,
                                            waiting = new :: ws,
                                            state = state }
                        RunErr m -> RunErr m
                _ -> RunErr "SEQ rule must be followed by process list only"

        Branch "out" (x::y::[]) -> 
            case (eval x state) of 
                Ok (Channel c) ->
                    case (eval y state) of
                        Ok (Number n) ->
                            Ran ( addLine (c ++ " ! " ++ (String.fromInt n)) 
                                { output = out,
                                running = rs,
                                waiting = ws,
                                state = state })
                        _ -> RunErr "must output number"
                Ok (Number n) -> RunErr "cannot output to number"
                _ -> RunErr "must output to channel"

        Branch "assign_expr" (id::e1::[]) ->
            case (eval e1 state) of
                Ok v -> 
                    case (update state id v) of
                        Ok s -> Ran { output = out,
                                    running = rs,
                                    waiting = ws,
                                    state = s }
                        Err m -> RunErr m
                Err m -> RunErr m
        
        Branch "assign_proc" (id::e1::[]) ->
            case (update state id (Process e1)) of
                Ok s -> Ran { output = out,
                            running = rs,
                            waiting = ws,
                            state = s }
                Err m -> RunErr m

        Leaf l -> case eval l state of 
            Process proc -> step proc out rs ws state
            _ -> RunErr "Tried to run variable, but it didn't hold a process"

        Branch _ _ -> RunErr "Wrong tree structure"

eval : Tree -> State -> Result String Value
eval t state =
    case t of
        Leaf (Ident s) -> 
            Need to actually look it up
        Leaf (Num n) -> Ok (Number n)
        Branch rule children -> Err "eval processing a tree"

update : State -> Tree -> Value -> Result String State
update state id v = 
    case id of
        Leaf (Ident str) -> Ok (Dict.insert str v state)
        _ -> Err "tried to assign to a number"


addLine : String -> Model -> Model
addLine s m = { output = m.output ++ s ++ "\n",
                running = m.running,
                waiting = m.waiting,
                state = m.state }