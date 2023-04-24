module State exposing (..)

import Dict exposing (Dict, member, empty, insert)
import Readfile exposing (Tree(..), TreeValue(..), Rule(..), ABop(..), LBop(..))
import Result exposing (andThen)

type alias Chan = { value: Value, isFull: Bool }

type ChanStorage = ChanSingle Chan | ChanArray (Dict Int ChanStorage)

type Value = Number Int | Boolval Bool | Array (Dict Int Value) | Any

type alias State = { vars: Dict String Value, chans: Dict String ChanStorage }

type alias Identifier = { str: String, dims: List Int }

freshChannel : Chan
freshChannel = { value = Any, isFull = False }

treeToId : State -> Tree -> Result String Identifier
treeToId state tree =
    case tree of
        Branch Id [(Leaf (Ident i)), Branch Dimensions ds] ->
            idMaker state i ds
        Branch DeclareChannel [Branch Dimensions ds, (Leaf (Ident i))] ->
            idMaker state i ds
        Branch DeclareVariable [Branch Dimensions ds, (Leaf (Ident i))] ->
            idMaker state i ds
        _ -> Err ("problem parsing ident with tree " ++ (printTree tree))

idMaker state i ds = treeToDimsList state ds |> andThen (\result -> Ok { str = i, dims = result })

treeToDimsList : State -> List Tree -> Result String (List Int)
treeToDimsList state ds =
    case ds of
        [] -> Ok []
        ((Leaf (Num n))::xs) -> (treeToDimsList state xs) |> andThen (\ys -> Ok (n::ys))
        ((Branch Id is)::xs) -> eval (Branch Id is) state |> andThen (\val -> case val of
                Number n -> (treeToDimsList state xs) |> andThen (\ys -> Ok (n::ys))
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


-- Returns a pair with the current value of the variable, and the state were it to be updated to the given value
derefAndUpdateVariable : Value -> String -> List Int -> State -> Result String (Value, State)
derefAndUpdateVariable val str dims state =
    let
        dAUArray v d ds dict =
            case ds of
                [] -> case Dict.get d dict of
                    Just (Array _) -> Err ("Not enough indexes for array " ++ str)
                    Just oldvalue -> Ok (oldvalue, Array (Dict.insert d v dict))
                    Nothing -> Err "Index out of bounds"
                (i::is) -> case Dict.get d dict of
                    Just (Array dict2) ->
                        dAUArray v i is dict2 |> Result.andThen (\(oldvalue, newstruct) ->
                            Ok (oldvalue, Array (Dict.insert d newstruct dict))
                        )
                    Just oldvalue -> Err ("Too many indexes for array " ++ str)
                    Nothing -> Err "Index out of bounds"
    in
        case Dict.get str state.vars of
            Nothing -> Err ("Variable " ++ str ++ " not declared")
            Just (Array dict) -> case dims of
                (d::ds) ->
                    dAUArray val d ds dict |> Result.andThen (\(accessedvalue, updatedvars)->
                        Ok (accessedvalue, {state | vars = Dict.insert str updatedvars state.vars })
                    )
                _ -> Err ("Not enough indices for array " ++ str)
            Just accessedvalue -> case dims of
                [] -> Ok (accessedvalue, {state | vars = Dict.insert str val state.vars})
                _ -> Err ("Too many indexes for array " ++ str)


-- Returns a pair with the current value of the variable, and the state if channel was updated to the new channel-value
derefAndUpdateChannel : Chan -> String -> List Int -> State -> Result String (Chan, State)
derefAndUpdateChannel ch str dims state =
    let
        dAUArray d ds dict =
            case ds of
                [] -> case Dict.get d dict of
                    Just (ChanArray _) -> Err ("Not enough indexes for array " ++ str)
                    Just (ChanSingle oldchan) -> Ok (oldchan, ChanArray (Dict.insert d (ChanSingle ch) dict))
                    Nothing -> Err "Index out of bounds"
                (i::is) -> case Dict.get d dict of
                    Just (ChanArray dict2) ->
                        dAUArray i is dict2 |> Result.andThen (\(oldchan, newstruct) ->
                            Ok (oldchan, ChanArray (Dict.insert d newstruct dict))
                        )
                    Just _ -> Err ("Too many indexes for array " ++ str)
                    Nothing -> Err "Index out of bounds"
    in
        case Dict.get str state.chans of
            Nothing -> Err ("Channel " ++ str ++ " not declared")
            Just (ChanArray dict) -> case dims of
                (d::ds) ->
                    dAUArray d ds dict |> Result.andThen (\(accessedvalue, updatedstruct)->
                        Ok (accessedvalue, {state | chans = Dict.insert str updatedstruct state.chans })
                    )
                _ -> Err ("Not enough indices for array " ++ str)
            Just (ChanSingle accessedchan) -> case dims of
                [] -> Ok (accessedchan, {state | chans = Dict.insert str (ChanSingle ch) state.chans})
                _ -> Err ("Too many indexes for array " ++ str)


eval : Tree -> State -> Result String Value
eval t state =
    case t of
        Branch Id [Leaf (Ident "TRUE"), Branch Dimensions []] -> Ok (Boolval True)
        Branch Id [Leaf (Ident "FALSE"), Branch Dimensions []] -> Ok (Boolval False)
        --need to put this in an init state

        Branch Id _ -> 
            treeToId state t |> andThen (\varid -> 
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


