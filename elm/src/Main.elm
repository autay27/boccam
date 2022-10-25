module Main exposing (..)

import Browser
import Html exposing (Html, button, div, text, br)
import Html.Events exposing (onClick)

import Compile exposing (Tree, Proc, WaitingProc, State)
import Dict exposing (Dict, empty)

-- MAIN

main =
  Browser.sandbox { init = init, update = update, view = view }

-- MODEL

type alias Model = { output: String, running: (List Proc), waiting: (List WaitingProc), state: State }

init : Model
init = { output = "",  running = [Compile.example_tree], waiting = [], state = Dict.empty }
--should generate it by calling a function

-- UPDATE

type Msg
  = Step | Run

update : Msg -> Model -> Model
update msg model =
  case msg of
    Step ->
      case Compile.run model of 
        Ok m -> m
        Err s -> { output = model.output ++ s ++ "\n",
                  running = model.running,
                  waiting = model.waiting,
                  state = model.state }
    Run -> 
                { output = model.output ++ "I don't know how to run\n",
                  running = model.running,
                  waiting = model.waiting,
                  state = model.state }

-- VIEW

print s = List.intersperse (br [] []) (List.map text (String.lines s))

view : Model -> Html Msg
view model =
  div []
    ( (print model.output) ++
    [ button [ onClick Step ] [ text "Step" ]])