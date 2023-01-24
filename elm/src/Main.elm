port module Main exposing (..)

import Browser
import Browser.Events exposing (onKeyDown)
import Html exposing (Html, button, div, text, br, hr)
import Html.Events exposing (onClick)
import Json.Decode

import Readfile exposing (Tree, treeDecoder)
import Compile exposing (run)
import Model exposing (Model, Proc, WaitingProc, spawn, print, enqKeypress, freshModel)
import KeyboardInput exposing (keyDecoder, Direction)

import Dict exposing (Dict, empty)
import Random exposing (generate, int)
import List exposing (length)


-- MAIN

main =
  Browser.element { init = init, update = update, subscriptions = subscriptions, view = view }

-- MODEL

init : () -> (Model, Cmd Msg)
init _ = 
  ( print "\n" (spawn [Compile.example_tree] -1 Nothing freshModel), Cmd.none)

-- UPDATE

type Msg
  = Step | Run | Thread Int | ReceivedDataFromJS Json.Decode.Value | ReceivedKeyboardInput Direction

update : Msg -> Model -> (Model, Cmd Msg)
update msg model =
  case msg of
    Step ->
      (model, Random.generate Thread (Random.int 0 (length model.running - 1)))
    Thread n ->
      case Compile.run model n of 
        Ok m -> (m, Cmd.none)
        Err s -> (print s model, Cmd.none)
    Run -> ((print "Running has not been implemented" model), Cmd.none)
    ReceivedDataFromJS data -> 
      case (Json.Decode.decodeValue treeDecoder data) of 
        Ok t -> ((spawn [t] -1 Nothing freshModel), Cmd.none)
        Err e -> ((print ("Error: " ++ (Json.Decode.errorToString e)) freshModel), Cmd.none)
    ReceivedKeyboardInput dir -> (enqKeypress dir model, Cmd.none)

port messageReceiver : (Json.Decode.Value -> msg) -> Sub msg

-- SUBSCRIPTIONS

subscriptions : Model -> Sub Msg
subscriptions _ =
  Sub.batch [ messageReceiver ReceivedDataFromJS, Browser.Events.onKeyDown (Json.Decode.map ReceivedKeyboardInput keyDecoder) ]

-- VIEW

printout s = List.intersperse (br [] []) (List.map text (String.lines s))

view : Model -> Html Msg
view model =
  div []
    ( 
      [ div [] [ text model.display ], hr [] [], button [ onClick Step ] [ text "Step" ], br [] []] ++
      (printout model.output)
    )