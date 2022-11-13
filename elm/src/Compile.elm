module Compile exposing (..)

import Dict exposing (Dict, empty, insert)

type TreeValue = Num Int | Ident String

type Tree = Leaf TreeValue | Branch String (List Tree)

--example_tree = Branch "seq" [Branch "proc_list" [Branch "out" [Leaf (Ident "chan"), Leaf (Num 0)], Branch "out" [Leaf (Ident "chan"), Leaf (Num 1)]]]

example_tree = Branch "seq" [Branch "proc_list"[
    Branch "declare_chan" [Leaf (Ident "chan")], 
    Branch "par" [Branch "proc_list" 
        [Branch "while" [Leaf (Ident "true"), Branch "out" [Leaf (Ident "chan"), Leaf (Num 1)]],
        Branch "while" [Leaf (Ident "true"), Branch "out" [Leaf (Ident "chan"), Leaf (Num 1)]]]]]]

-- simulating program
--I really want to change from string identifiers for branches to just having crap ton of... what are they called, idk, the different instances of Tree. 
--I also want to make it more monadic, look at all the times i re-create the Model, this is what monads are for. I will do this in the winter

type WaitCond = PlchldWait

type Outcome a b c = RunErr a | Ran b | Blocked c

type Value = Number Int | Channel String | Process Proc | Boolval Bool

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
                Err msg -> RunErr ("Tried to output but: " ++ msg)
                _ -> RunErr "must output to a channel"

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

        Branch "while" (cond::e1::[]) ->
            case (eval cond state) of
                Ok (Boolval True) -> 
                    let aw = Branch "active_while" [cond,e1,e1] in
                        Ran (addLine "evald while cond to true" { output = out,
                            running = (aw::rs),
                            waiting = ws,
                            state = state })
                Ok (Boolval False) -> Ran { output = out,
                                            running = rs,
                                            waiting = ws,
                                            state = state }
                _ -> RunErr "Condition must evaluate to boolean value"
                --in the future, may need to account for if the cond contains an input (check spec for if this is possible)
        
        Branch "active_while" (cond::original::e1::[]) ->
            case (step e1 out [] ws state) of
                Ran model -> case model.running of 
                    [] -> let w = Branch "while" [cond, original] in
                        Ran { output = model.output,
                            running = (w::rs),
                            waiting = ws,
                            state = state }
                    (y::ys) -> let aw = Branch "active_while" [cond, original, Branch "par" (y::ys)] in
                        Ran { output = model.output,
                            running = (aw::rs),
                            waiting = ws,
                            state = state }
                Blocked wc -> let new = {  proc = e, waitingFor = wc } in
                        Ran ( addLine "while body blocked" { output = out,
                            running = rs,
                            waiting = new :: ws,
                            state = state })
                RunErr msg -> RunErr msg
--not very space efficient to store two copies of the code

        Branch "declare_chan" ((Leaf (Ident id))::[]) -> 
            case (update state (Leaf (Ident id)) (Channel id)) of
                Ok state2 -> Ran ( addLine ("declared " ++ id) { output = out,
                                running = rs,
                                waiting = ws,
                                state = state2 })
                Err msg -> RunErr msg

        Leaf l -> case eval (Leaf l) state of 
            Ok (Process proc) -> step proc out rs ws state
            _ -> RunErr "Tried to run variable, but it didn't hold a process"

        Branch s _ -> RunErr ("Wrong tree structure for " ++ s)

eval : Tree -> State -> Result String Value
eval t state =
    case t of
        Leaf (Ident "true") -> Ok (Boolval True)
        --need to put this in an init state
        Leaf (Ident s) -> 
            case Dict.get s state of
                Just v -> Ok v
                Nothing -> Err ("Variable " ++ s ++ " not declared")
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