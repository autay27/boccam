module Doyoucompile exposing (..)
import Dict exposing (Dict, empty)

type Value = Num Int | Ident String

type Tree = Leaf Value | Branch String (List Tree)

example_tree = Branch "par" [Branch "proc_list" [Branch "out" [Leaf (Ident "chan"), Leaf (Num 0)], 
                                                Branch "out" [Leaf (Ident "chan"), Leaf (Num 1)]]]

-- type alias State = Dict String (Maybe Int)
type alias State = String

type alias Memory = Dict String Int

type alias Channel = String 

type Action = Output Channel Value

-- emptyState = Dict.empty
emptyState = ""

execute e = run (getActions e) emptyState

run : (List (List Action)) State -> State
run actions state = case actions of
    (xs::xss) -> run xss (enact xs state)
    [] -> state

enact xs state = state 


Basically it's a mess because we can't just represent the program as a list of lists of actions. But we can have a list of the next step to take and that's basically all I need to generate right now.