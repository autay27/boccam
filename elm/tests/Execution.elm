module Execution exposing (..)

import Expect exposing (Expectation)
import Fuzz exposing (Fuzzer, int, list, string)
import Test exposing (..)

import Json.Decode
import Readfile exposing (Tree(..), Rule(..), TreeValue(..))
import Main exposing (update, Msg(..))
import Model exposing (Model, spawn, print, freshModel)

testNumSteps = 50

flipping = Branch Seq [Branch ProcList [
    Branch DeclareChannel [Leaf (Ident "chan")], 
    Branch DeclareChannel [Leaf (Ident "chan2")], 
    Branch DeclareVariable [Leaf (Ident "x")], 
    Branch AssignExpr [Leaf (Ident "x"), Leaf (Num 0)],
    Branch Par [
        Branch ProcList [
            Branch While [Leaf (Ident "TRUE"),
                Branch Seq [ 
                    Branch Out [Leaf (Ident "chan"), Leaf (Num 0)],
                    Branch Out [Leaf (Ident "chan"), Leaf (Num 1)] 
                ],
                Branch While [Leaf (Ident "TRUE"), 
                    Branch In [Leaf (Ident "chan"), Leaf (Ident "x")],
                    Branch Out [Leaf (Ident "DISPLAY"), Leaf (Ident "x")]
                ]
            ]
        ]
    ]]]

suite : Test
suite =
    describe "channels" 
        [
            test "flipping values passed through channel in right order" <|
                \_ -> 
                    case (update (RunUntil testNumSteps) (spawn [flipping] -1 Nothing freshModel, Nothing)) of
                        ((model, _), _) -> Expect.all [
                            (\disp -> Expect.equal True (Tuple.first (List.foldl (\new (b, old) -> ((new /= old) && b, new)) (True, 1) disp))),
                            (\disp -> Expect.greaterThan 0 (List.length disp))
                            ] model.display
        ]
