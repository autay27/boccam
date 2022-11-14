module Main exposing (..)

import Browser
import Html exposing (Html, button, div, text, br)
import Html.Events exposing (onClick)

import Compile exposing (Tree, Proc, WaitingProc, State)
import Dict exposing (Dict, empty)
import Random exposing (generate, int)
import List exposing (length)

-- MAIN

main =
  Browser.element { init = init, update = update, subscriptions = subscriptions, view = view }

-- MODEL

type alias Model = { output: String, running: (List Proc), waiting: (List WaitingProc), state: State }

init : () -> (Model, Cmd Msg)
init _ = 
  ({ output = "",  running = [Compile.example_tree], waiting = [], state = Dict.empty }
  , Cmd.none
  )

-- UPDATE

type Msg
  = Step | Run | Thread Int

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

-- SUBSCRIPTIONS


subscriptions : Model -> Sub Msg
subscriptions model =
  Sub.none


-- VIEW

print s = List.intersperse (br [] []) (List.map text (String.lines s))

view : Model -> Html Msg
view model =
  div []
    ( (print model.output) ++
    [ button [ onClick Step ] [ text "Step" ]])