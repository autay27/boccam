module StateUtils exposing (..)

import Dict exposing (Dict, member, empty, insert)
import Readfile exposing (Tree(..), TreeValue(..), Rule(..))
import Eval exposing (eval)
import Result exposing (andThen)

type alias Chan = { value: Value, isFull: Bool }

type ChanStorage = ChanSingle Chan | ChanArray (Dict Int ChanStorage)

type Value = Number Int | Boolval Bool | Array (Dict Int Value) | Any

type alias State = { vars: Dict String Value, chans: Dict String ChanStorage }

type alias Identifier = { str: String, dims: List Int }

freshChannel : Chan
freshChannel = { value = Any, isFull = False }

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

makeChanArray : List Int -> ChanStorage
makeChanArray dimensions =
    case dimensions of
        [] -> ChanSingle freshChannel
        (x::xs) -> ChanArray (List.foldr (\d -> insert d (makeChanArray xs)) Dict.empty (List.range 0 (x-1)))

makeVarArray : List Int -> Value
makeVarArray dimensions =
    case dimensions of
        [] -> Any
        (x::xs) -> Array (List.foldr (\d -> insert d (makeVarArray xs)) Dict.empty (List.range 0 (x-1)))

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
