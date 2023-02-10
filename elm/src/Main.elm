port module Main exposing (..)

import Browser
import Browser.Events exposing (onKeyDown)
import Html exposing (Html, button, div, text, br, hr)
import Html.Events exposing (onClick)
import Json.Decode

import Readfile exposing (Tree, treeDecoder)
import Compile exposing (run)
import Model exposing (Model, Proc, WaitingProc, spawn, print, enqKeypress, fulfilRandom, isBlocked, freshModel)
import KeyboardInput exposing (keyDecoder, Direction)

import Dict exposing (Dict, empty)
import Random exposing (generate, int, Seed, step)
import List exposing (length)


-- MAIN

main =
  Browser.element { init = init, update = update, subscriptions = subscriptions, view = view }

-- MODEL

seed0 : Maybe Seed
seed0 = Just (Random.initialSeed 2001)

init : () -> ((Model, Maybe Seed), Cmd Msg)
init _ = 
  ( ((print "\n" (spawn [Compile.example_tree] -1 Nothing freshModel)), seed0), Cmd.none)

-- UPDATE

type Msg
  = Step | Run | Thread Int | Fulfilment Msg Int | ReceivedDataFromJS Json.Decode.Value | ReceivedKeyboardInput Direction

update : Msg -> (Model, Maybe Seed) -> ((Model, Maybe Seed), Cmd Msg)
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
          let 
            whileNotNone somecmd p = 
              let (p2, somecmd2) = update somecmd p in
                if somecmd2 == Cmd.none then p2 else whileNotNone somecmd2 p2
            pair2 = whileNotNone Step pair
          in
            if isBlocked (Tuple.first pair2) then (pair2, Cmd.none) else update Run pair2

        ReceivedDataFromJS data -> 
          case (Json.Decode.decodeValue treeDecoder data) of 
            Ok t -> ((spawn [t] -1 Nothing freshModel, seed), Cmd.none)
            Err e -> ((print ("Error: " ++ (Json.Decode.errorToString e)) freshModel, seed), Cmd.none)

        ReceivedKeyboardInput dir -> ((enqKeypress dir model, seed), Cmd.none)

port messageReceiver : (Json.Decode.Value -> msg) -> Sub msg
 
randomBelow : (Maybe Seed) -> (Int -> Msg) -> Int -> (Cmd Msg, Maybe Seed)
randomBelow seed msgmaker n =
  case seed of 
    Nothing -> (Random.generate msgmaker (Random.int 0 (n - 1)), Nothing)
    Just s -> case Random.step (Random.int 0 (n - 1)) s of 
      (m, newseed) -> (Random.generate msgmaker (Random.constant m), Just newseed)
 
-- SUBSCRIPTIONS

subscriptions : (Model, Maybe Seed) -> Sub Msg
subscriptions _ =
  Sub.batch [ messageReceiver ReceivedDataFromJS, Browser.Events.onKeyDown (Json.Decode.map ReceivedKeyboardInput keyDecoder) ]

-- VIEW

printout s = List.intersperse (br [] []) (List.map text (String.lines s))

view : (Model, Maybe Seed) -> Html Msg
view pair =
  let (model, _) = pair in
    div []
      ( 
        [ div [] [ text model.display ], hr [] [], button [ onClick Step ] [ text "Step" ], br [] []] ++
        (printout model.output)
      )