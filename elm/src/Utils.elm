module Utils exposing (..)

import Readfile exposing (Tree(..), TreeValue(..), Rule(..))
import Eval exposing (eval)
import State exposing (State, Value(..), checkFull, Identifier)
import KeyboardInput exposing (Direction(..))

replaceLeaf : Tree -> Tree -> Tree -> Tree
replaceLeaf old new code =
    case code of
        Branch rule xs ->
            Branch rule (List.map (replaceLeaf old new) xs)
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
