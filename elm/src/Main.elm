port module Main exposing (..)

import Browser
import Browser.Events exposing (onKeyDown)
import Html exposing (Html, button, div, text, br, hr)
import Html.Events exposing (onClick)
import Html.Attributes exposing (class)
import Json.Decode

import Readfile exposing (Tree, treeDecoder, Rule(..))
import Compile exposing (run)
import Model exposing (Model, Proc, WaitingProc, spawn, print, enqKeypress, fulfilRandom, isBlocked, freshModel)
import State exposing (toJson)
import KeyboardInput exposing (keyDecoder, Direction)

import Dict exposing (Dict, empty)
import Random exposing (generate, int, Seed, step)
import List exposing (length)


-- MAIN

main =
  Browser.element { init = init, update = update, subscriptions = subscriptions, view = view }

-- MODEL

seed0 : Maybe Int
seed0 = Just 0

init : () -> ((Model, Maybe Int), Cmd Msg)
init _ = 
  ( ((print "\n" (spawn [Compile.example_tree] -1 Nothing freshModel)), seed0), Cmd.none)

-- UPDATE

type Msg
  = Step | Thread Int | Run | RunThread Int | Fulfilment Msg Int | ReceivedDataFromJS Json.Decode.Value | ReceivedKeyboardInput Direction

update : Msg -> (Model, Maybe Int) -> ((Model, Maybe Int), Cmd Msg)
update msg pair =
  case pair of 
    (model, seed) ->
      case msg of

        Step ->
          let (cmdmsg, seed2) = randomBelow seed Thread (length model.running) in
            ((model, seed2), cmdmsg)
            
        Thread n ->
          case Compile.run model n of 
            Ok m -> 
              case m.randomGenerator.request of
                Just k -> 
                  let (cmdmsg, seed2) = randomBelow seed (Fulfilment (Thread n)) k in
                    ((model, seed2), cmdmsg)
                Nothing -> ((m, seed), Cmd.none)
            Err s -> ((print s model, seed), Cmd.none)

        Fulfilment t f -> update t (fulfilRandom f model, seed)

        Run -> 
          if isBlocked model then
            ((print "Terminated" model, seed), Cmd.none)
          else
            let (cmdmsg, seed2) = randomBelow seed RunThread (length model.running) in
              ((model, seed2), cmdmsg)

        RunThread n ->
          case Compile.run model n of 
            Ok m -> 
              case m.randomGenerator.request of
                Just k -> 
                  let (cmdmsg, seed2) = randomBelow seed (Fulfilment (RunThread n)) k in
                    ((model, seed2), cmdmsg)
                Nothing -> update Run (m, seed)
            Err s -> update Run (print s model, seed)        

        ReceivedDataFromJS data -> 
          case (Json.Decode.decodeValue treeDecoder data) of 
            Ok t -> ((spawn [t] -1 Nothing freshModel, seed), Cmd.none)
            Err e -> ((print ("Error: " ++ (Json.Decode.errorToString e)) freshModel, seed), Cmd.none)

        ReceivedKeyboardInput dir -> ((enqKeypress dir model, seed), Cmd.none)

port messageReceiver : (Json.Decode.Value -> msg) -> Sub msg
 
randomBelow : (Maybe Int) -> (Int -> Msg) -> Int -> (Cmd Msg, Maybe Int)
randomBelow seed msgmaker n =
  case seed of 
    Nothing -> (Random.generate msgmaker (Random.int 0 (n - 1)), Nothing)
    Just m -> let chosen = modBy n m in 
      (Random.generate msgmaker (Random.constant chosen), Just (m+1))
 
-- SUBSCRIPTIONS

subscriptions : (Model, Maybe Int) -> Sub Msg
subscriptions _ =
  Sub.batch [ messageReceiver ReceivedDataFromJS, 
              Browser.Events.onKeyDown (Json.Decode.map ReceivedKeyboardInput keyDecoder)]

-- VIEW

printout s = List.intersperse (br [] []) (List.map text (String.lines s))

view : (Model, Maybe Int) -> Html Msg
view pair =
  let (model, _) = pair in
    div [class "twopanel"] [
      div []
        ( 
          [ div [] [ text model.display ], hr [] [], button [ onClick Step ] [ text "Step" ], button [ onClick Run ] [ text "Run" ], br [] []] ++
          (printout model.output)
        ),
      div []
        (
          [ div [] [text "State:"], div [] (printout (State.toJson model.state))]
        )
    ]