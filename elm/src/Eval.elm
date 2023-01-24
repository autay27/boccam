module Eval exposing (..)

import Readfile exposing (Tree(..), TreeValue(..), Rule(..), ABop(..), LBop(..))
import State exposing (State, Value(..))
import Dict

eval : Tree -> State -> Result String Value
eval t state =
    case t of
        Leaf (Ident "TRUE") -> Ok (Boolval True)
        --need to put this in an init state

        Leaf (Ident s) -> 
            case Dict.get s state.vars of
                Just v -> Ok v
                Nothing -> Err ("Variable " ++ s ++ " not declared")

        Leaf (Num n) -> Ok (Number n)

        Branch (ABinop b) (x::y::[]) -> arithEval b x y state

        Branch (LBinop b) (x::y::[]) -> logicEval b x y state

        Branch rule children -> Err "not a valid value"

arithEval op x y state =
    eval x state |> Result.andThen (\v1 -> eval y state |> Result.andThen(\v2 -> 
        case (v1, v2) of 
            (Number n1, Number n2) -> 
                case op of 
                    Plus -> Ok (Number (n1 + n2))
                    Minus -> Ok (Number (n1 - n2))
                    Times -> Ok (Number (n1 * n2))
                    Divide -> Ok (Number (n1 // n2))
                    --placeholder, don't know if this is in occam
            _ -> Err "Invalid arguments for this operator"
    ))

logicEval op x y state =
    eval x state |> Result.andThen (\v1 -> eval y state |> Result.andThen(\v2 -> 
        case (v1, v2) of 
            (Boolval b1, Boolval b2) -> 
                case op of
                    And -> Ok (Boolval (b1 && b2))
                    Or -> Ok (Boolval (b1 || b2))
            _ -> Err "Invalid arguments for this operator"
    ))