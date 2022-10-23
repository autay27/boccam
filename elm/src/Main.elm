module Main exposing (..)

import Browser
import Html exposing (Html, Attribute, div, input, text)
import Html.Attributes exposing (..)
import Html.Events exposing (onInput)
import Json.Decode exposing (Decoder, int, string, list, oneOf)


type Leaf = Str String | IntVal Int

type Ast = Leaf | Nested (List Ast)

testast: Ast
testast = [Str "hello",Nested [Str "hi"]]

-- MAIN

main =
  Browser.sandbox { init = init, update = update, view = view }

-- model

type alias Model =
  { content : Ast }

init : Model
init =
  { content = ["par",["proc_list",["out","chan",0],["out","chan",1]]] }

-- view

filename = "../../exampleast.json"

view : Model -> Html Msg

view model =
    div [] [ "hello" ]
--  div [] [ head model.content ]

-- update

type Msg
  = Change String

update : Msg -> Model -> Model
update msg model =
  case msg of
    Change newContent ->
      { model | content = [] }

