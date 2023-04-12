module Constructs2 exposing (..)

import Expect exposing (Expectation)
import Fuzz exposing (Fuzzer, int, list, string)
import Test exposing (..)
import ProgramTest exposing (clickButton, start, expectModel)

import Json.Decode
import Readfile exposing (Tree(..), Rule(..), TreeValue(..))
import Main exposing (init, update, subscriptions, view)
import Model exposing (Model, spawn, print, freshModel)

testNumSteps = 50

for_seq_simple =
    Branch Seq [Branch Replicator [Leaf (Ident "i"), Leaf (Num 1), Leaf (Num 5)],
        Branch Out [Leaf (Ident "DISPLAY"), Leaf (Ident "i")]]

constructsTwo : Test
constructsTwo =
    test "does anything happen" <|
        \() ->
            ProgramTest.createElement
                {
                    init = Main.init,
                    update = Main.update,
                    view = Main.view
                }
                |> start ()
                |> clickButton "Step"
                |> expectModel (\model -> Expect.equal (spawn [for_seq_simple] -1 Nothing freshModel) model )