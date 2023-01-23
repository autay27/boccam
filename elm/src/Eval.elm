module Eval exposing (..)
import Readfile exposing (Tree(..), Rule(..))


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

        Branch rule children -> Err "eval processing a tree"

