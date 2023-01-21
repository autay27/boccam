module State exposing (..)

import Dict exposing (Dict, member, empty, insert)
import Readfile exposing (Tree(..), TreeValue(..))

type alias Chan = { value: Value, isFull: Bool }

type Value = Number Int | Channel String | Boolval Bool | Any

type alias State = { vars: Dict String Value, chans: Dict String Chan }

displaychanname = "DISPLAY"

freshState = { vars = Dict.empty, chans = (Dict.insert displaychanname freshChannel Dict.empty) }

freshChannel = { value = Any, isFull = False }

getName : Tree -> Result String String
getName tree = case tree of
    Leaf (Ident str) -> Ok str
    _ -> Err "Invalid name for a variable or channel"

checkFull : State -> Tree -> Result String Bool
checkFull state var = 
    case getName var of
        Ok str -> case Dict.get str state.chans of
            Just ch ->  Ok ch.isFull
            Nothing -> Err "channel not declared"
        _ -> Err "not a channel"
        
assignVar : State -> Tree -> Value -> Result String State
assignVar state var val = 
    case getName var of 
        Ok str ->
            if Dict.member str state.chans then 
                Err "tried to assign to a channel" 
            else 
                Ok {state | vars = (Dict.insert str val state.vars)}
        _ -> Err "not a valid variable name"

declareVar : State -> Tree -> Result String State
declareVar state var = 
    case getName var of 
        Ok str ->    
            if Dict.member str state.vars then 
                Err ("declared a variable " ++ str ++ " that already exists")
            else
                assignVar state var Any
        _ -> Err "not a valid variable name"

declareChan : State -> Tree -> Result String State
declareChan state var = 
    case getName var of 
        Ok str ->  
            if Dict.member str state.vars then 
                    Err ("tried to declare " ++ str ++ " as a channel, but it is already a variable")
                else if Dict.member str state.chans then 
                        Err "channel already declared"
                    else 
                        Ok {state | chans = (Dict.insert str freshChannel state.chans)}
        _ -> Err "tried to declare, but name was a number"