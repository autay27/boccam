module KeyboardInput exposing (..)

import Json.Decode as Decode

-- adapted from https://github.com/elm/browser/blob/1.0.2/notes/keyboard.md

type Direction
  = Left
  | Right
  | Other

keyDecoder : Decode.Decoder Direction
keyDecoder =
  Decode.map toDirection (Decode.field "key" Decode.string)

toDirection : String -> Direction
toDirection string =
  case string of
    "ArrowLeft" ->
      Left

    "ArrowRight" ->
      Right

    _ ->
      Other