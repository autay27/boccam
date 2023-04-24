module Utils exposing (..)

import List exposing (map, head, drop, take)
import Html exposing (Html)
import Svg exposing (svg, rect)
import Svg.Attributes exposing (width, height, viewBox, x, y, fill)


import Readfile exposing (Tree(..), TreeValue(..), Rule(..))
import State exposing (State, Value(..), Identifier, eval)
import StateUtils exposing (checkFull)
import KeyboardInput exposing (Direction(..))
import Model exposing (Model, Graphics)

replaceSubtree : Tree -> Tree -> Tree -> Tree
replaceSubtree old new code =
    case code of
        Branch rule xs ->
            if (Branch rule xs) == old then new else Branch rule (List.map (replaceSubtree old new) xs)
        Leaf l -> if (Leaf l) == old then new else (Leaf l)

pickValidBranches : List Tree -> State -> Result String (List Tree)
pickValidBranches alts state = 
    let 
        flattenAlt ys = case ys of 
            [] -> Ok []
            (z::zs) -> case z of 
                Branch Alternative [Branch Guard _, _] -> 
                    flattenAlt zs |> Result.andThen (\therest -> 
                        Ok (z::therest)
                    )
                Branch Alternative [Branch Alt [Branch AltList qs], _] -> 
                    flattenAlt qs |> Result.andThen (\flattened -> 
                        flattenAlt zs |> Result.andThen (\therest -> 
                            Ok (flattened ++ therest)
                        ))
                _ -> Err "Invalid ALT branch"
        filterByGuard ys = case ys of
            [] -> Ok []
            (x::xs) -> filterByGuard xs |> Result.andThen (\therest ->
                case x of 
                    Branch Alternative [Branch Guard (bool::input::[]), proc] ->
                        case eval bool state of 
                            Ok (Boolval True) -> case input of         
                                Branch In (chan::var::[]) ->
                                    checkFull state chan |> Result.andThen (\f -> 
                                        if f then Ok (x::therest) else Ok therest
                                    )
                                Branch Skip _ -> Ok (x::therest)
                                _ -> Err "unexpected channel in alternative branch"
                            Ok (Boolval False) -> Ok therest
                            Ok _ -> Err "Expression in front of a guard on an alt branch must be boolean"
                            Err msg -> Err msg
                    _ -> Err "Unexpected branch in alternative"
                )
    in
        flattenAlt alts |> Result.andThen filterByGuard

dirToValue : Direction -> Value
dirToValue dir =
    case dir of
        Left -> Number 0
        Right -> Number 1
        Other -> Number 2

numberToColor : Int -> String
numberToColor n = case n of
    0 -> "black"
    1 -> "grey"
    2 -> "white"
    3 -> "red"
    4 -> "yellow"
    5 -> "limegreen"
    6 -> "cyan"
    7 -> "blue"
    8 -> "magenta"
    _ -> numberToColor 0

zipWithIndex : List a -> List (a, Int)
zipWithIndex xs =
  List.map2 Tuple.pair xs (List.range 0 ((List.length xs) - 1))

graphicsAddCoords : Graphics -> List (Int, (Int, Int))
graphicsAddCoords xs =
    zipWithIndex (map zipWithIndex xs) |> List.concatMap (\(ys, i) -> map (\(color, j) -> (color, (i,j))) ys )

itemToRect : (Int, (Int, Int)) -> Html msg
itemToRect item = case item of
    (color, (i,j)) ->
        rect
            [ x (String.fromInt (10*j))
            , y (String.fromInt (10*i))
            , width "10"
            , height "10"
            , fill (numberToColor color)
            ]
            []

printgraphics : Graphics -> Html msg
printgraphics graphics =
  svg
    [ width "320"
    , height "320"
    , viewBox "0 0 320 320"
    ]
    (map itemToRect (graphicsAddCoords graphics))

updateCell : Model -> Value -> Identifier -> Result String Model
updateCell model value cid =
    case value of
        Number n ->
            case cid.dims of
                [x, y] -> updateCoord n x y model.graphics |> Result.andThen (\newGraphics ->
                        Ok {model | graphics = newGraphics }
                    )
                _ -> Err "Incorrect number of dimensions for graphics channel array (requires 2)"
        Boolval _ ->  Err "Cannot output boolean to a pixel"
        Array _ -> Err "Cannot output array to a pixel"
        Any -> Err "Trying to output value which has not been set yet to a pixel"

updateCoord : Int -> Int -> Int -> Graphics -> Result String Graphics
updateCoord n x y graphics =
    let
        newcol =
            if (0 <= x) && (x < List.length graphics) then
                case head (drop x graphics) of
                    Just somecol ->
                        if (0 <= y) && (y < List.length graphics) then
                            Ok ((take y somecol) ++ (n :: (drop (y+1) somecol)))
                        else
                            Err "Graphics y-coordinate out of bounds"
                    _ -> Err "Graphics x-coordinate out of bounds"
            else
                Err "Graphics x-coordinate out of bounds"
    in
        newcol |> Result.andThen (\col ->
            Ok ((take x graphics) ++ (col :: (drop (x+1) graphics)))
        )
