port module Main exposing (..)

import Browser
import Html exposing (Html, button, div, text, br)
import Html.Events exposing (onClick)

import Readfile exposing (Tree, treeDecoder)
import Compile exposing (run)
import Model exposing (Model, Proc, WaitingProc, spawn, print, freshModel)

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
  ( print "\n" (spawn [Compile.example_tree] -1 Nothing freshModel), Cmd.none)

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
        Err s -> (print s model, Cmd.none)
    Run -> ((print "Running has not been implemented" model), Cmd.none)
    ReceivedDataFromJS data -> 
      case (Json.Decode.decodeValue treeDecoder data) of 
        Ok t -> ((spawn [t] -1 Nothing freshModel), Cmd.none)
        Err e -> ((print ("Error: " ++ (Json.Decode.errorToString e)) freshModel), Cmd.none)

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