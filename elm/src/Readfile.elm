module Readfile exposing (..)

import Json.Decode exposing (Decoder, field, int, string, list, map, map2, oneOf, lazy, andThen, succeed, fail)

type TreeValue = Num Int | Ident String 

type Tree = Leaf TreeValue | Branch Rule (List Tree)

type Rule = Skip | ProcList | Par | Seq | Alt | AltList | Alternative | Guard | In | Out | AssignExpr | AssignProc | While | DeclareChannel | DeclareVariable | ABinop ABop | LBinop LBop 

type ABop = Plus | Minus | Times | Div
type LBop = And | Or


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
        "par" -> succeed Par
        "seq" -> succeed Seq
        "proc_list" -> succeed ProcList
        "alt" -> succeed Alt
        "alt_list" -> succeed AltList
        "alternative" -> succeed Alternative
        "guard" -> succeed Guard
        "in" -> succeed In
        "out" -> succeed Out
        "assign_expr" -> succeed AssignExpr
        "assign_proc" -> succeed AssignProc
        "while" -> succeed While
        "declare_var" -> succeed DeclareVariable
        "declare_chan" -> succeed DeclareChannel
        "SKIP" -> succeed Skip
        "AND" -> succeed (LBinop And)
        "OR" -> succeed (LBinop Or)
        "PLUS" -> succeed (ABinop Plus)
        "MINUS" -> succeed (ABinop Minus)
        "TIMES" -> succeed (ABinop Times)
        "DIV" -> succeed (ABinop Div)
        _ -> fail ("Invalid grammar rule" ++ str)

numDecoder : Decoder Tree
numDecoder =
    map Leaf (map Num (field "numleaf" int))

idDecoder : Decoder Tree
idDecoder =
    map Leaf (map Ident (field "idleaf" string))