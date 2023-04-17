module State exposing (..)

import Dict exposing (Dict, member, empty, insert)
import Readfile exposing (Tree(..), TreeValue(..), Rule(..))
import StateUtils exposing (..)

import Json.Encode exposing (encode, dict)
import Html exposing (s)
import Result exposing (andThen)

displaychanname = "DISPLAY"
keyboardchanname = "KEYBOARD"

freshState = { vars = Dict.empty, chans = (Dict.insert keyboardchanname freshChannel(Dict.insert displaychanname freshChannel Dict.empty)) }

accessChannel : String -> List Int -> State -> Result String Chan
accessChannel str dims state =
    let 
        indexIntoArray ds dict = 
            case ds of
                [] -> Err ("Not enough indexes for array " ++ str)
                (i::is) -> case Dict.get i dict of
                    Just (ChanSingle ch) -> if is == [] then Ok ch else Err ("Too many indexes for array " ++ str)
                    Just (ChanArray arr) -> indexIntoArray is arr
                    Nothing -> Err ("Index " ++ (String.fromInt i) ++ " out of bounds for " ++ str)
    in
        case Dict.get str state.chans of
            Just (ChanSingle ch) -> if List.length dims == 0 then Ok ch else Err (str ++ " is not an array but indexes given")
            Just (ChanArray dict) -> indexIntoArray dims dict
            Nothing -> Err "Channel not declared"

checkFull : State -> Tree -> Result String Bool
checkFull state var =
    treeToId var |> andThen (\id ->
            accessChannel id.str id.dims state |> andThen (\ch -> Ok ch.isFull)
        )

assignVar : State -> Tree -> Value -> Result String State
assignVar state var val =
    treeToId var |> andThen (\id ->
            if Dict.member id.str state.chans then Err "tried to assign to a channel" 
            else derefAndUpdateVariable val id.str id.dims state |> andThen (\(ov, newstate) -> 
                    Ok newstate)
        )


declareVar : State -> Tree -> Result String State
declareVar state var = 
    treeToId var |> andThen (\id ->
        if Dict.member id.str state.vars then 
            Err ("declared a variable " ++ id.str ++ " that already exists")
        else if Dict.member id.str state.chans then 
            Err ("tried to declare " ++ id.str ++ " as a variable, but it is already a channel")
        else 
            let freshvars = makeVarArray id.dims in Ok {state | vars = Dict.insert id.str freshvars state.vars }
    )

declareChan : State -> Tree -> Result String State
declareChan state var =
    treeToId var |> andThen (\id ->    
        if Dict.member id.str state.vars then 
            Err ("tried to declare " ++ id.str ++ " as a channel, but it is already a variable")
        else if Dict.member id.str state.chans then 
                Err (id.str ++ "channel already declared")
        else 
            let
                freshchans = makeChanArray id.dims
            in
                Ok {state | chans = (Dict.insert id.str freshchans state.chans)}
    )

toJson : State -> String
toJson state = encode 4 (dict identity jsonValues state.vars)

jsonValues : Value -> Json.Encode.Value
jsonValues val = 
    case val of 
        Number n -> Json.Encode.int n
        Boolval b -> Json.Encode.bool b
        Array xs -> Json.Encode.string "Array - not printed yet"
        Any -> Json.Encode.string "ANY"
