port module Main exposing (..)

import Browser
import Browser.Events exposing (onKeyDown)
import Html exposing (Html, button, div, text, br, hr)
import Html.Events exposing (onClick)
import Html.Attributes exposing (class)
import Json.Decode

import Readfile exposing (Tree, treeDecoder, Rule(..))
import Compile exposing (run)
import Model exposing (Model, Proc, WaitingProc, spawn, print, enqKeypress, fulfilRandom, isBlocked, freshModel, updateSeed)
import State exposing (toJson)
import KeyboardInput exposing (keyDecoder, Direction)

import Dict exposing (Dict, empty)
import Random exposing (generate, int, Seed, step)
import List exposing (length)


-- MAIN

main =
  Browser.element { init = init, update = update, subscriptions = subscriptions, view = view }

-- MODEL

type Effect
  = NoEffect
  | RandomBelow { msgmaker : (Int -> Msg), n : Int }

init : Json.Decode.Value -> (Model, Effect)
init json = 
  case (Json.Decode.decodeValue treeDecoder json) of 
    Ok t -> ( (print "\n" (spawn [t] -1 Nothing freshModel)), NoEffect)
    Err e -> ((print "Error parsing JSON!" (spawn [] -1 Nothing freshModel)), NoEffect)
  
-- UPDATE

type Msg
  = Step | Thread Int | RunUntil Int | RunThread Int Int | Fulfilment Msg Int | ReceivedDataFromJS Json.Decode.Value | ReceivedKeyboardInput Direction

update : Msg -> Model -> (Model, Effect)
update msg model =
  case msg of

    Step ->
      let (cmdmsg, seed) = randomBelow model.randomSeed Thread (length model.running) in
        (updateSeed seed model, cmdmsg)
        
    Thread n ->
      case Compile.run model n of 
        Ok m -> 
          case m.randomGenerator.request of
            Just k -> 
              let (cmdmsg, seed) = randomBelow model.randomSeed (Fulfilment (Thread n)) k in
                (updateSeed seed model, cmdmsg)
            Nothing -> (model, NoEffect)
        Err s -> ((print s model), NoEffect)

    Fulfilment t f -> update t (fulfilRandom f model)

    RunUntil n -> 
      if isBlocked model then
        ((print "Terminated" model), NoEffect)
      else
        case n of 
          0 -> (model, NoEffect)
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
        Err s -> update (RunUntil countdown) (print s model)       

    ReceivedDataFromJS data -> 
      case (Json.Decode.decodeValue treeDecoder data) of 
        Ok t -> (spawn [t] -1 Nothing freshModel, NoEffect)
        Err e -> ((print ("Error: " ++ (Json.Decode.errorToString e)) freshModel), NoEffect)

    ReceivedKeyboardInput dir -> (enqKeypress dir model, NoEffect)

port messageReceiver : (Json.Decode.Value -> msg) -> Sub msg
 
randomBelow : (Maybe Int) -> (Int -> Msg) -> Int -> (Effect, Maybe Int)
randomBelow seed msgmaker n =
  case seed of 
    Nothing -> (Random.generate msgmaker (Random.int 0 (n - 1)), Nothing)
    Just m -> let chosen = modBy n m in 
      (Random.generate msgmaker (Random.constant chosen), Just (m+1))

perform : Effect -> Cmd Msg
perform effect = 
  case effect of
      NoEffect -> Cmd.none

      RandomBelow r -> Random.generate r.msgmaker (Random.int 0 (r.n - 1))

-- SUBSCRIPTIONS

subscriptions : Model -> Sub Msg
subscriptions _ =
  Sub.batch [ messageReceiver ReceivedDataFromJS, 
              Browser.Events.onKeyDown (Json.Decode.map ReceivedKeyboardInput keyDecoder)]

-- VIEW

printout s = List.intersperse (br [] []) (List.map text (String.lines s))

printdisplay display = 
  let 
    str = case List.head display of 
      Nothing -> ""
      Just n -> String.fromInt n 
  in text str

view : Model -> Html Msg
view model =
  div [class "twopanel"] [
    div []
      ( 
        [ div [] [ printdisplay model.display ], hr [] [], button [ onClick Step ] [ text "Step" ], button [ onClick (RunUntil 50) ] [ text "Run 50 steps" ], br [] []] ++
        (printout model.output)
      ),
    div []
      (
        [ div [] [text "State:"], div [] (printout (State.toJson model.state)), div [] [text "DisplayLog:"], div [] [(text (String.join ", " (List.map String.fromInt model.display)))]]
      )
  ]
