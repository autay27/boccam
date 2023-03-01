module FromJson exposing (..)

import Expect exposing (Expectation)
import Fuzz exposing (Fuzzer, int, list, string)
import Test exposing (..)

import Json.Decode
import Readfile exposing (treeDecoder)

json1 = "{\"rule\":\"seq\",\"children\":[{\"rule\":\"proc_list\",\"children\":[{\"rule\":\"declare_chan\",\"children\":[{\"idleaf\":\"chan\"}]},{\"rule\":\"declare_var\",\"children\":[{\"idleaf\":\"x\"}]},{\"rule\":\"declare_var\",\"children\":[{\"idleaf\":\"y\"}]},{\"rule\":\"assign_expr\",\"children\":[{\"idleaf\":\"x\"},{\"numleaf\":0}]},{\"rule\":\"par\",\"children\":[{\"rule\":\"proc_list\",\"children\":[{\"rule\":\"while\",\"children\":[{\"idleaf\":\"TRUE\"},{\"rule\":\"seq\",\"children\":[{\"rule\":\"proc_list\",\"children\":[{\"rule\":\"out\",\"children\":[{\"idleaf\":\"chan\"},{\"idleaf\":\"x\"}]},{\"rule\":\"assign_expr\",\"children\":[{\"idleaf\":\"x\"},{\"rule\":\"PLUS\",\"children\":[{\"idleaf\":\"x\"},{\"numleaf\":1}]}]}]}]}]},{\"rule\":\"while\",\"children\":[{\"idleaf\":\"TRUE\"},{\"rule\":\"seq\",\"children\":[{\"rule\":\"proc_list\",\"children\":[{\"rule\":\"in\",\"children\":[{\"idleaf\":\"chan\"},{\"idleaf\":\"y\"}]},{\"rule\":\"out\",\"children\":[{\"idleaf\":\"DISPLAY\"},{\"idleaf\":\"y\"}]}]}]}]}]}]}]}]}"

suite : Test
suite =
    describe "Decoding JSON strings to Tree" 
        [
            test "Any old tree" <|
                \_ -> Expect.ok (Json.Decode.decodeString treeDecoder json1)
        ]