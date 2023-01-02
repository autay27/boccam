port module Main exposing (..)

import Browser
import Html exposing (Html, button, div, text, br)
import Html.Events exposing (onClick)

import Readfile exposing (Tree, treeDecoder)
import Compile exposing (Model, Proc, WaitingProc, State, freshModel, spawn, print)
import Dict exposing (Dict, empty)
import Random exposing (generate, int)
import List exposing (length)

import Json.Decode

-- MAIN

main =
  Browser.element { init = init, update = update, subscriptions = subscriptions, view = view }

-- MODEL

init : () -> (Model, Cmd Msg)
init _ = 
  ({ output = "\n",  running = [Compile.example_tree], waiting = [], state = Dict.empty }
  , Cmd.none
  )

-- UPDATE

type Msg
  = Step | Run | Thread Int | ReceivedDataFromJS Json.Decode.Value

update : Msg -> Model -> (Model, Cmd Msg)
update msg model =
  case msg of
    Step ->
      (model, Random.generate Thread (Random.int 0 (length model.running - 1)))
    Thread n ->
      case Compile.run model n of 
        Ok m -> (m, Cmd.none)
        Err s -> ({ output = model.output ++ s ++ "\n",
                  running = model.running,
                  waiting = model.waiting,
                  state = model.state }, Cmd.none)
    Run -> 
                ({ output = model.output ++ "I don't know how to run\n",
                  running = model.running,
                  waiting = model.waiting,
                  state = model.state }, Cmd.none)
    ReceivedDataFromJS data -> 
      case (Json.Decode.decodeValue treeDecoder data) of 
        Ok t -> ((spawn [t] freshModel), Cmd.none)
        Err e -> ((print (Json.Decode.errorToString e) freshModel), Cmd.none)
    
    

port messageReceiver : (Json.Decode.Value -> msg) -> Sub msg

-- SUBSCRIPTIONS


subscriptions : Model -> Sub Msg
subscriptions _ =
  messageReceiver ReceivedDataFromJS


-- VIEW

printout s = List.intersperse (br [] []) (List.map text (String.lines s))

view : Model -> Html Msg
view model =
  div []
    ( 
      [ button [ onClick Step ] [ text "Step" ]] ++
      (printout model.output)
    )