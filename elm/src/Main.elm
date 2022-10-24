module Main exposing (..)

import Browser
import Html exposing (Html, button, div, text, br)
import Html.Events exposing (onClick)

import Compile exposing (Tree, Proc, WaitingProc, State)

-- MAIN

main =
  Browser.sandbox { init = init, update = update, view = view }

-- MODEL

type alias Model = { output: String, running: (List Proc), waiting: (List WaitingProc), state: State }

init : Model
init = { output = "",  running = [example_tree], waiting = [], state = Dict.empty }
--should generate it by calling a function

-- UPDATE

type Msg
  = Step | Run

update : Msg -> Model -> Model
update msg model =
  case msg of
    Step ->
      model ++ "\na"
    Run -> 
      model ++ "\nI don't know how to run"

-- VIEW

view : Model -> Html Msg
view model =
  div []
    [ div [] [ text model.output ]
    , button [ onClick Step ] [ text "Step" ]]