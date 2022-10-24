module Run exposing (..)

import Dict exposing (Dict, empty)

type TreeValue = Num Int | Ident String

type Tree = Leaf TreeValue | Branch String (List Tree)

example_tree = Branch "par" [Branch "proc_list" [Branch "out" [Leaf (Ident "chan"), Leaf (Num 0)], 
                                                Branch "out" [Leaf (Ident "chan"), Leaf (Num 1)]]]

-- simulating program

type Value = Number Int | Channel Chan

type alias Chan = { inUse: Bool, value: Value, lastUser: Int }

type alias State = Dict String Value

type alias Proc = Tree

type alias WaitingProc = { proc: Proc, myID: Int, waitingFor: String }

execute : Tree -> Result String Int
execute e = 
    let emptyState = Dict.empty in
        run [e] [] emptyState 

run : (List Proc) -> (List WaitingProc) -> State -> Result String Int
run rs ws state =
    case rs of
        (x::xs) ->
            --we won't do it randomly for now
            let r = step x xs ws state in
                case r of 
                    Ok (rs2, ws2, state2) -> run rs2 ws2 state2
                    Err string -> Err string
        [] -> Ok 0

step e rs ws state =
    case e of
        Branch rule (x::xs) ->
            case rule of
                "par" -> 
                    case x of
                        Branch "proc_list" ys -> Ok ((rs ++ ys), ws, state)
                        _ -> Err "PAR rule must be followed by process list"
                --Should be an Ok and make Ok include the output
                "out" -> Err "I tried to output" 
                _ -> Err "Unknown rule"
        Branch _ _ -> Err "Wrong tree structure"
        Leaf value -> Err "Process cannot be just a value"