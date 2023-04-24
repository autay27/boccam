module Eval exposing (..)

import Readfile exposing (Tree(..), TreeValue(..), Rule(..), ABop(..), LBop(..))
import StateUtils exposing (State, Value(..), treeToId, derefAndUpdateVariable)
import Result exposing (andThen)

eval : Tree -> State -> Result String Value
eval t state =
    case t of
        Branch Id [Leaf (Ident "TRUE"), Branch Dimensions []] -> Ok (Boolval True)
        Branch Id [Leaf (Ident "FALSE"), Branch Dimensions []] -> Ok (Boolval False)
        --need to put this in an init state

        Branch Id _ -> 
            treeToId t |> andThen (\varid -> 
                derefAndUpdateVariable Any varid.str varid.dims state |> andThen (\(val, _) ->
                    Ok val
                )
            )

        Leaf (Num n) -> Ok (Number n)

        Branch (ABinop b) (x::y::[]) -> arithEval b x y state

        Branch (LBinop b) (x::y::[]) -> logicEval b x y state

        _ -> Err "not a valid value"

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

treeToId : Tree -> Result String Identifier
treeToId tree =
    case tree of
        Branch Id [(Leaf (Ident i)), Branch Dimensions ds] ->
            idMaker i ds
        Branch DeclareChannel [Branch Dimensions ds, (Leaf (Ident i))] ->
            idMaker i ds
        Branch DeclareVariable [Branch Dimensions ds, (Leaf (Ident i))] ->
            idMaker i ds
        _ -> Err ("problem parsing ident with tree " ++ (printTree tree))

idMaker i ds = treeToDimsList ds |> andThen (\result -> Ok { str = i, dims = result })

treeToDimsList : List Tree -> Result String (List Int)
treeToDimsList ds =
    case ds of
        [] -> Ok []
        ((Leaf (Num n))::xs) -> (treeToDimsList xs) |> andThen (\ys -> n::ys)
        ((Branch Id is)::xs) -> eval (Branch Id is) |> andThen (\val -> case val of
                Number n -> (treeToDimsList xs) |> andThen (\ys -> n::ys)
                _ -> Err "Dimension must be a number"
            )
        _ -> Err "Issue evaluating dimensions!"

ruleToString : Rule -> String
ruleToString r = case r of
    Skip -> "Skip"
    ProcList -> "ProcList"
    Par -> "Par"
    Seq -> "Seq"
    Alt -> "Alt"
    AltList -> "AltList"
    Alternative -> "Alternative"
    Guard -> "Guard"
    In -> "In"
    Out -> "Out"
    AssignExpr -> "AssignExpr"
    AssignProc -> "AssignProc"
    Id -> "Id"
    Dimensions -> "Dimensions"
    While -> "While"
    Cond -> "Cond"
    ChoiceList -> "ChoiceList"
    GuardedChoice -> "GuardedChoice"
    Replicator -> "Replicator"
    DeclareChannel -> "DeclareChannel"
    DeclareVariable -> "DeclareVariable"
    ABinop _ -> "ABop"
    LBinop _ -> "LBop"

printTree : Tree -> String
printTree t = case t of
    Leaf (Ident i) -> "Ident " ++ i
    Leaf (Num n) -> "Num " ++ (String.fromInt n)
    Branch rule xs -> (ruleToString rule) ++ "[" ++ ((List.map printTree xs) |> (List.intersperse ", ") |> String.concat) ++ "]"
