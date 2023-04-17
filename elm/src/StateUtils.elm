module StateUtils exposing (..)

import Dict exposing (Dict, member, empty, insert)
import Readfile exposing (Tree(..), TreeValue(..), Rule(..))

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
            Ok { str = i, dims = treeToDimsList ds }
        Branch DeclareChannel [Branch Dimensions ds, (Leaf (Ident i))] ->
            Ok { str = i, dims = treeToDimsList ds }
        Branch DeclareVariable [Branch Dimensions ds, (Leaf (Ident i))] ->
            Ok { str = i, dims = treeToDimsList ds }
        _ -> Err "Problem with identifier parsing"

treeToDimsList : List Tree -> List Int
treeToDimsList ds =
    case ds of
        [] -> []
        ((Leaf (Num n))::xs) -> n::(treeToDimsList xs)
        _ -> [-11111]
        
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
            Nothing -> Err "Variable not declared"
            Just (Array dict) -> case dims of 
                (d::ds) -> 
                    dAUArray val d ds dict |> Result.andThen (\(accessedvalue, updatedvars)->
                        Ok (accessedvalue, {state | vars = Dict.insert str updatedvars state.vars })
                    )
                _ -> Err ("Not enough indices for array " ++ str)
            Just accessedvalue -> case dims of
                [] -> Ok (accessedvalue, {state | vars = Dict.insert str val state.vars})
                _ -> Err ("Too many indexes for array " ++ str)

            