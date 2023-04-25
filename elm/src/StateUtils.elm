module StateUtils exposing (..)

import Dict exposing (Dict, member, empty, insert)
import Readfile exposing (Tree(..), TreeValue(..), Rule(..))
import State exposing (..)

import Json.Encode exposing (encode, dict)
import Html exposing (s)
import Result exposing (andThen)

displaychanname = "DISPLAY"
keyboardchanname = "KEYBOARD"
graphicschanname = "GRAPHICS"

displaychanid = { str = displaychanname, dims = [] }
keyboardchanid = { str = keyboardchanname, dims = [] }

freshState : State
freshState =
    {
        vars = Dict.empty,
        chans = Dict.empty |>
            Dict.insert displaychanname (ChanSingle freshChannel) |>
            Dict.insert keyboardchanname (ChanSingle freshChannel)
    }

dummyChannel = freshChannel

fillChannel : Value -> Identifier -> State -> Result String State
fillChannel val chanid state =
    let
        filledchan = { isFull = True, value = val }
    in
        derefAndUpdateChannel filledchan chanid.str chanid.dims state |> andThen (\(_, newstate) -> Ok newstate)

getValueAndEmptyChannel : Identifier -> State -> Result String (Value, State)
getValueAndEmptyChannel chanid state =
    derefAndUpdateChannel freshChannel chanid.str chanid.dims state |> andThen (\(oldchan, newstate) ->
        Ok (oldchan.value, newstate)
    )

accessChannel : Identifier -> State -> Result String Chan
accessChannel chanid state =
    derefAndUpdateChannel dummyChannel chanid.str chanid.dims state |> andThen (\(oldchan, _) -> Ok oldchan)

checkFull : State -> Tree -> Result String Bool
checkFull state var =
    treeToId state var |> andThen (\id ->
            accessChannel id state |> andThen (\ch -> Ok ch.isFull)
        )

assignVar : State -> Tree -> Value -> Result String State
assignVar state var val =
    treeToId state var |> andThen (\id ->
            if Dict.member id.str state.chans then Err "tried to assign to a channel"
            else derefAndUpdateVariable val id.str id.dims state |> andThen (\(ov, newstate) ->
                    Ok newstate)
        )


declareVar : State -> Tree -> Result String State
declareVar state var =
    treeToId state var |> andThen (\id ->
        if Dict.member id.str state.vars then
            Err ("declared a variable " ++ id.str ++ " that already exists")
        else if Dict.member id.str state.chans then
            Err ("tried to declare " ++ id.str ++ " as a variable, but it is already a channel")
        else
            let freshvars = makeVarArray id.dims in Ok {state | vars = Dict.insert id.str freshvars state.vars }
    )

declareChan : State -> Tree -> Result String State
declareChan state var =
    treeToId state var |> andThen (\id ->
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
        Array xs -> Json.Encode.dict String.fromInt jsonValues xs
        Any -> Json.Encode.string "ANY"


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
