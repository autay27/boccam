module Readfile exposing (..)

import Json.Decode exposing (Decoder, field, int, string, list, map, map2, oneOf, lazy, decodeString, andThen, succeed, fail)

type TreeValue = Num Int | Ident String

type Tree = Leaf TreeValue | Branch Rule (List Tree)

type Rule = ProcList | Par | Seq | Out | AssignExpr | AssignProc | While | ActiveWhile | DeclareChannel

-- Decoding

treeDecoder : Decoder Tree
treeDecoder = oneOf [branchDecoder, numDecoder, idDecoder]

branchDecoder : Decoder Tree
branchDecoder = 
    map2 Branch
        (field "rule" ruleDecoder)
        (field "children" (list (lazy (\_ -> treeDecoder))))

ruleDecoder : Decoder Rule
ruleDecoder = string |> andThen ruleFromString

ruleFromString : String -> Decoder Rule
ruleFromString str =
    case str of
        "proc_list" -> succeed ProcList
        "par" -> succeed Par
        "seq" -> succeed Seq
        "out" -> succeed Out
        "assign_expr" -> succeed AssignExpr
        "assign_proc" -> succeed AssignProc
        "while" -> succeed While
        "declare_chan" -> succeed DeclareChannel
        _ -> fail ("Invalid grammar rule" ++ str)

numDecoder : Decoder Tree
numDecoder =
    map Leaf (map Num (field "numleaf" int))

idDecoder : Decoder Tree
idDecoder =
    map Leaf (map Ident (field "idleaf" string))