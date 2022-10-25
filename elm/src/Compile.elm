module Compile exposing (..)

import Dict exposing (Dict, empty)

type TreeValue = Num Int | Ident String

type Tree = Leaf TreeValue | Branch String (List Tree)

example_tree = Branch "par" [Branch "proc_list" [Branch "out" [Leaf (Ident "chan"), Leaf (Num 0)], 
                                                Branch "out" [Leaf (Ident "chan"), Leaf (Num 1)]]]

-- simulating program

type Value = Number Int | Channel String

type alias Chan = { inUse: Bool, value: Value, lastUser: Int }

type alias State = Dict String Value

type alias Proc = Tree

type alias WaitingProc = { proc: Proc, myID: Int, waitingFor: String }

type alias Model = { output: String, running: (List Proc), waiting: (List WaitingProc), state: State }

--execute : Tree -> Result String Int
--execute e = 
--    let emptyState = Dict.empty in
--        run [e] [] emptyState 

run : Model -> Result String Model
run m =
    case m.running of
        (x::xs) ->
            --we won't do it randomly for now
            step x m.output xs m.waiting m.state 
        [] -> Err "program finished"

step : Proc -> String -> (List Proc) -> (List WaitingProc) -> State -> Result String Model
step e out rs ws state =
    case e of

        Branch "par" (x::[]) ->
            case x of
                Branch "proc_list" ys -> 
                    run { output = out,
                        running = (rs ++ ys), 
                        waiting = ws, 
                        state = state}
                _ -> Err "PAR rule must be followed by process list only"

        Branch "out" (x::y::[]) -> 
            case (eval x state) of 
                Ok (Channel c) ->
                    case (eval y state) of
                        Ok (Number n) ->
                            Ok ( addLine (c ++ " ! " ++ (String.fromInt n)) 
                                { output = out,
                                running = rs,
                                waiting = ws,
                                state = state })
                        _ -> Err "must output number"
                Ok (Number n) -> Err "cannot output to number"
                _ -> Err "must output to channel"

        Branch _ _ -> Err "Wrong tree structure"
        Leaf value -> Err "Process cannot be just a value"

eval : Tree -> State -> Result String Value
eval t state =
    case t of
        Leaf (Ident s) -> Ok (Channel s)
        Leaf (Num n) -> Ok (Number n)
        Branch rule children -> Err "eval processing a tree"

addLine : String -> Model -> Model
addLine s m = { output = m.output ++ s ++ "\n",
                running = m.running,
                waiting = m.waiting,
                state = m.state }