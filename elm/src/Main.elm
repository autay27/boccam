port module Main exposing (..)

import Browser
import Browser.Events exposing (onKeyDown)
import Html exposing (Html, button, div, text, br, hr)
import Html.Events exposing (onClick)
import Html.Attributes exposing (class)
import Json.Decode
import Time


import Readfile exposing (Tree, treeDecoder, Rule(..))
import Compile exposing (run)
import Model exposing (Model, Proc, WaitingProc, spawn, print, enqKeypress, fulfilRandom, isBlocked, freshModel, updateSeed)
import StateUtils
import KeyboardInput exposing (keyDecoder, Keypress)
import Utils exposing (printgraphics)

import Dict exposing (Dict, empty)
import Random exposing (generate, int, Seed, step)
import List exposing (length)


-- MAIN

main =
  Browser.element { init = init, update = update, subscriptions = subscriptions, view = view }

-- MODEL

seed0 : Maybe Int
seed0 = Just 0

init : Json.Decode.Value -> (Model, Cmd Msg)
init json = 
  case (Json.Decode.decodeValue treeDecoder json) of 
    Ok t -> ( (print "\n" (spawn [t] -1 Nothing freshModel)), Cmd.none)
    Err e -> ((print "Error parsing JSON!" (spawn [] -1 Nothing freshModel)), Cmd.none)
  
-- UPDATE

type Msg
  = Step | Thread Int | RunUntil Int | RunThread Int Int | Fulfilment Msg Int | ReceivedDataFromJS Json.Decode.Value | ReceivedKeyboardInput Keypress | Tick Time.Posix | RunOverTime | StopRunning

update : Msg -> Model -> (Model, Cmd Msg)
update msg model =
  case msg of

    Step ->
      if isBlocked model && ((Model.isWaitingForKeyboard model) == False) then
        if Model.isFinished model then
          update StopRunning (print "Program finished" model)
        else
          update StopRunning (print "Program blocked" model)
      else
        let (cmdmsg, seed) = randomBelow model.randomSeed Thread (length model.running) in
          (updateSeed seed model, cmdmsg)
        
    Thread n ->
      case Compile.run model n of 
        Ok m -> 
          case m.randomGenerator.request of
            Just k -> 
              let (cmdmsg, seed) = randomBelow m.randomSeed (Fulfilment (Thread n)) k in
                (updateSeed seed model, cmdmsg)
            Nothing -> (m, Cmd.none)
        Err s -> ((print s model), Cmd.none)

    Fulfilment t f -> update t (fulfilRandom f model)

    RunUntil n -> 
      if isBlocked model then
        if Model.isFinished model then
          update StopRunning (print "Program finished" model)
        else
          update StopRunning (print "Program blocked" model)
      else
        case n of 
          0 -> (model, Cmd.none)
          _ -> let (cmdmsg, seed) = randomBelow model.randomSeed (RunThread n) (length model.running) in
            (updateSeed seed model, cmdmsg)

    RunThread countdown n ->
      case Compile.run model n of 
        Ok m -> 
          case m.randomGenerator.request of
            Just k -> 
              let (cmdmsg, seed) = randomBelow m.randomSeed (Fulfilment (RunThread countdown n)) k in
                (updateSeed seed model, cmdmsg)
            Nothing -> update (RunUntil (countdown - 1)) m
        Err s -> update (RunUntil (countdown - 1)) (print s model)

    ReceivedDataFromJS data -> 
      case (Json.Decode.decodeValue treeDecoder data) of 
        Ok t -> (spawn [t] -1 Nothing freshModel, Cmd.none)
        Err e -> ((print ("Error: " ++ (Json.Decode.errorToString e)) freshModel), Cmd.none)

    ReceivedKeyboardInput dir -> (enqKeypress dir model, Cmd.none)

    RunOverTime -> (Model.setRunFlag model, Cmd.none)

    StopRunning -> (Model.unsetRunFlag model, Cmd.none)

    Tick posix ->
      if model.runFlag then
        if isBlocked model then
          if Model.isFinished model then
            update StopRunning (print "Program finished" model)
          else
            if Model.isWaitingForKeyboard model then
              update Step model
            else
              update StopRunning (print "Program blocked" model)
        else update Step model
      else
        (model, Cmd.none)


port messageReceiver : (Json.Decode.Value -> msg) -> Sub msg
 
randomBelow : (Maybe Int) -> (Int -> Msg) -> Int -> (Cmd Msg, Maybe Int)
randomBelow seed msgmaker n =
  case seed of 
    Nothing -> (Random.generate msgmaker (Random.int 0 (n - 1)), Nothing)
    Just m -> let chosen = modBy n m in 
      (Random.generate msgmaker (Random.constant chosen), Just (m+1))
 
-- SUBSCRIPTIONS

subscriptions : Model -> Sub Msg
subscriptions _ =
  Sub.batch [ messageReceiver ReceivedDataFromJS, 
              Browser.Events.onKeyDown (Json.Decode.map ReceivedKeyboardInput keyDecoder),
              Time.every 20 Tick ]

-- VIEW

printout s = List.intersperse (br [] []) (List.map text s)

printdisplay display = 
  let 
    str = case List.head display of 
      Nothing -> ""
      Just n -> String.fromInt n 
  in text str

runovertimebtn model = if model.runFlag then button [ onClick (StopRunning) ] [ text "Pause" ] else button [ onClick (RunOverTime) ] [ text "Run" ]

maybeSerial model = if (List.length model.display) > 0 then [ hr [] [], div [] [text "Serial Output Log:"], div [] [(text (String.join ", " (List.map String.fromInt model.display)))], hr [] [] ] else [ hr [] [] ]

view : Model -> Html Msg
view model =
  div [class "twopanel"] [
    div []
      ( 
        [ button [ onClick Step ] [ text "Step" ], button [ onClick (RunUntil 50) ] [ text "50 Steps" ], runovertimebtn model, hr [] [], div [] [text "Channel Activity:"]] ++
        (printout model.output)
      ),
    div []
      (
        [ div [] [ printgraphics model.graphics ] ] ++ (maybeSerial model) ++ [ div [] [text "Variables:"], div [] (printout [(StateUtils.toJson model.state)])]
      )
  ]
