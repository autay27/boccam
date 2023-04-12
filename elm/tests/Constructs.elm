module Constructs exposing (..)

import Expect exposing (Expectation)
import Fuzz exposing (Fuzzer, int, list, string)
import Test exposing (..)

import Json.Decode
import Readfile exposing (Tree(..), Rule(..), TreeValue(..))
import Main exposing (update, Msg(..))
import Model exposing (Model, spawn, print, freshModel)

testNumSteps = 50

for_seq_simple =
    Branch Seq [Branch Replicator [Leaf (Ident "i"), Leaf (Num 1), Leaf (Num 5)],
        Branch Out [Leaf (Ident "DISPLAY"), Leaf (Ident "i")]]

suite : Test
suite =
    describe "replicators" 
        [
            test "did anything happen?" <|
                \_ -> 
                    (spawn [for_seq_simple] -1 Nothing freshModel, Nothing)
                        |> update Step
                        |> Tuple.first |> Tuple.first
                        |> (\model -> Expect.equal (spawn [for_seq_simple] -1 Nothing freshModel) model)
            ,
            test "replicator with seq, first step" <|
                \_ -> 
                    (spawn [for_seq_simple] -1 Nothing freshModel, Nothing)
                        |> update Step
                        |> Tuple.first |> Tuple.first
                        |> (\model -> Expect.equal [1] model.display)
            ,
            test "replicator with seq, simple" <|
                \_ -> 
                    case (update (RunUntil testNumSteps) (spawn [for_seq_simple] -1 Nothing freshModel, Nothing)) of 
                        ((model, _), _) -> Expect.equal [5,4,3,2,1] model.display
        ]
