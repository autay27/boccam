module Readfile exposing (..)

import Json.Decode exposing (Decoder, field, int, string, list, map, map2, oneOf, lazy, decodeString)

type Value = Num Int | Ident String

type Tree = Leaf Value | Branch String (List Tree)

example_text = "{\"rule\":\"par\",\"children\":[{\"rule\":\"proc_list\",\"children\":[{\"rule\":\"out\",\"children\":[{\"idleaf\":\"chan\"},{\"numleaf\":0}]},{\"rule\":\"out\",\"children\":[{\"idleaf\":\"chan\"},{\"numleaf\":1}]}]}]}"

example_read_tree = decodeString treeDecoder example_text

read_tree = decodeString treeDecoder

-- Decoding

treeDecoder : Decoder Tree
treeDecoder = oneOf [branchDecoder, numDecoder, idDecoder]

branchDecoder : Decoder Tree
branchDecoder = 
    map2 Branch
        (field "rule" string)
        (field "children" (list (lazy (\_ -> treeDecoder))))

numDecoder : Decoder Tree
numDecoder =
    map Leaf (map Num (field "numleaf" int))

idDecoder : Decoder Tree
idDecoder =
    map Leaf (map Ident (field "idleaf" string))