module State exposing (..)

import Dict exposing (Dict, member, empty, insert)
import Readfile exposing (Tree(..), TreeValue(..), Rule(..))
import StateUtils exposing (..)

import Json.Encode exposing (encode, dict)
import Html exposing (s)
import Result exposing (andThen)

type alias Chan = { value: Value, isFull: Bool }

type ChanStorage = ChanSingle Chan | ChanArray (Dict Int ChanStorage)

type Value = Number Int | Channel String | Boolval Bool | Array (Dict Int Value) | Any

type alias State = { vars: Dict String Value, chans: Dict String ChanStorage }

type alias Identifier = { str: String, dims: List Int }

displaychanname = "DISPLAY"
keyboardchanname = "KEYBOARD"

freshState = { vars = Dict.empty, chans = (Dict.insert keyboardchanname freshChannel(Dict.insert displaychanname freshChannel Dict.empty)) }

freshChannel = { value = Any, isFull = False }

checkFull : State -> Tree -> Result String Bool
checkFull state var =
    treeToId var |> andThen (\id ->
            accessChannel id state |> Result.andThen (\ch -> ch.isFull)
        )

--if we move the "check declared' part in here we can get rid of the extra function which for some reason gets called only once in Compile
assignVar : State -> Tree -> Value -> Result String State
assignVar state var val =
    treeToId var |> andThen (\id ->

    )


    case getName var of 
        Ok str ->
            if Dict.member str state.chans then 
                Err "tried to assign to a channel" 
            else 
                Ok {state | vars = (Dict.insert str val state.vars)}
        _ -> Err "not a valid variable name"

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

declareChan : State -> Tree -> List Int -> Result String State
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

checkDeclared : Tree -> State -> Result String ()
checkDeclared var state =
    case getName var of 
        Ok str ->
            if Dict.member str state.vars then Ok () else Err ("variable " ++ str ++ " not declared")
        _ -> Err "invalid variable name"

toJson : State -> String
toJson state = encode 4 (dict identity jsonValues state.vars)

jsonValues : Value -> Json.Encode.Value
jsonValues val = 
    case val of 
        Number n -> Json.Encode.int n
        Channel s -> Json.Encode.string s
        Boolval b -> Json.Encode.bool b
        Any -> Json.Encode.string "ANY"
