module KeyboardInput exposing (..)

import Json.Decode as Decode

-- adapted from https://github.com/elm/browser/blob/1.0.2/notes/keyboard.md

type Keypress
  = Key1 | Key2 | Key3 | Key4 | Key5 | Key6 | Key7 | Key8 | Key9 | Key0

keyDecoder : Decode.Decoder Keypress
keyDecoder =
  Decode.map toDirection (Decode.field "key" Decode.string)

toDirection : String -> Keypress
toDirection string =
  case string of
    "1" ->
      Key1

    "2" ->
      Key2

    _ ->
      Key3