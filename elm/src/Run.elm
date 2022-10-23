module Run exposing (..)

import Dict exposing (Dict, empty)

type Value = Num Int | Ident String

type Tree = Leaf Value | Branch String (List Tree)

example_tree = Branch "par" [Branch "proc_list" [Branch "out" [Leaf (Ident "chan"), Leaf (Num 0)], 
                                                Branch "out" [Leaf (Ident "chan"), Leaf (Num 1)]]]

-- simulating program

type alias State = Dict String Int

type Action = Output Value Value

execute : Tree -> ()
execute e = 
    let
        emptyState = Dict.empty
        (actions, e2) = getActions e emptyState
    in
        run actions e2 emptyState 

run : (List Action) -> Tree -> State -> ()
run actions e state =
    case actions of
        (x::xs) -> 
            let 
                state2 = enact actions state
                (actions2, e2) = getActions e state2
            in
                run actions2 e2 state2
        [] -> ()

enact : (List Action) -> State -> State
enact actions state = state
--gah

getActions : Tree -> State -> ((List Action), Tree)
getActions e state = ([], e)