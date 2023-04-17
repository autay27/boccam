module Eval exposing (..)

import Readfile exposing (Tree(..), TreeValue(..), Rule(..), ABop(..), LBop(..))
import StateUtils exposing (State, Value(..))
import Dict

eval : Tree -> State -> Result String Value
eval t state =
    case t of
        Leaf (Ident "TRUE") -> Ok (Boolval True)
        Leaf (Ident "FALSE") -> Ok (Boolval False)
        --need to put this in an init state

        Leaf (Ident s) -> 
            case Dict.get s state.vars of
                Just v -> Ok v
                Nothing -> Err ("Variable " ++ s ++ " not declared")

        Leaf (Num n) -> Ok (Number n)

        Branch (ABinop b) (x::y::[]) -> arithEval b x y state

        Branch (LBinop b) (x::y::[]) -> logicEval b x y state

        Branch rule children -> Err "not a valid value"

arithEval: ABop -> Tree -> Tree -> State -> Result String Value
arithEval op x y state =
    eval x state |> Result.andThen (\v1 -> eval y state |> Result.andThen(\v2 -> 
        case (v1, v2) of 
            (Number n1, Number n2) -> 
                case op of 
                    Plus -> Ok (Number (n1 + n2))
                    Minus -> Ok (Number (n1 - n2))
                    Times -> Ok (Number (n1 * n2))
                    Div -> Ok (Number (n1 // n2))
                    Eq -> Ok (Boolval (n1 == n2))
                    Gt -> Ok (Boolval (n1 > n2))
                    Lt -> Ok (Boolval (n1 < n2))
                    Ge -> Ok (Boolval (n1 >= n2))
                    Le -> Ok (Boolval (n1 <= n2))
                    --placeholder, don't know if this is in occam
            _ -> Err "Invalid arguments for this operator"
    ))

logicEval: LBop -> Tree -> Tree -> State -> Result String Value
logicEval op x y state =
    eval x state |> Result.andThen (\v1 -> eval y state |> Result.andThen(\v2 -> 
        case (v1, v2) of 
            (Boolval b1, Boolval b2) -> 
                case op of
                    And -> Ok (Boolval (b1 && b2))
                    Or -> Ok (Boolval (b1 || b2))
            _ -> Err "Invalid arguments for this operator"
    ))