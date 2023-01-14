module Compile exposing (..)

import Dict exposing (Dict, insert)
import List exposing (head, take, drop, map, filter)
import Readfile exposing (Tree(..), TreeValue(..), Rule(..))
import Model exposing (..)

example_tree = Branch Seq [Branch ProcList[
    Branch DeclareChannel [Leaf (Ident "chan")], 
    Branch Seq [Branch ProcList 
        [Branch While [Leaf (Ident "TRUE"), Branch Out [Leaf (Ident "chan"), Leaf (Num 1)]],
        Branch While [Leaf (Ident "TRUE"), Branch Out [Leaf (Ident "chan"), Leaf (Num 0)]]]]]]

-- simulating program

type Outcome a b c d = RunErr a | Ran b | Unrolled c | Blocked d

run : Model -> Int -> Result String Model
run m n = (make_step m n) |> Result.andThen unblock

make_step : Model -> Int -> Result String (Model, Id)
make_step m n =
    case m.running of
        (x::xs) -> 
            let
                chosen = head (drop n m.running)
                notChosen = (take n m.running) ++ (drop (n+1) m.running)
            in
                case chosen of 
                    Just t ->
                        let m2 = {  m | running = notChosen }
                        in 
                            case step t m2 of
                                Ran s -> Ok (s, t.id)
                                Unrolled s -> unblock (s, t.id) |> Result.andThen (\newm -> make_step newm n) 
                                -- not exactly uniform prob. anymore but it's better
                                RunErr e -> Err e
                                Blocked wc -> Err "Blocking reached top level"
                    Nothing -> Err "Failed to choose a thread"
        [] -> Err "program finished"

unblock : (Model, Id) -> Result String Model
unblock (m, id) = 
    let
        updatedAfterTermination = map (\p -> case p.waitCond of
            Terminated xs -> { p | waitCond = Terminated (filter (\x -> x /= id) xs) }
            _ -> p
            ) m.waiting
        (unblocked, stillWaiting) = List.partition (\p -> p.waitCond == Terminated []) updatedAfterTermination
        unblockedProcs = map (\p -> p.proc) unblocked
    in
        Ok (basic_spawn unblockedProcs { m | waiting = stillWaiting })

-- we can also remove i from m.ids here

step : Proc -> Model -> Outcome String Model Model WaitCond
step e m = let state = m.state in
    case e.code of

        Branch Par (x::[]) ->
            case x of
                Branch ProcList ys -> Unrolled (spawn ys e.id e.ancestorId m)
                _ -> RunErr "PAR rule must be followed by process list only"

        Branch Seq (x::[]) ->
            case x of 
                Branch ProcList [] -> Ran m
                Branch ProcList (y::ys) -> 
                    Unrolled (spawnAndWait y (Branch Seq [Branch ProcList ys]) e.id e.ancestorId m)
                _ -> RunErr "SEQ rule must be followed by process list only"

        Branch Out (x::y::[]) -> 
            case (eval x state) of 
                Ok (Channel c) ->
                    case (eval y state) of
                        Ok (Number n) ->
                            Ran ( print (c ++ " ! " ++ (String.fromInt n)) m)
                        _ -> RunErr "must output number"
                Err msg -> RunErr ("Tried to output but: " ++ msg)
                _ -> RunErr "must output to a channel"

        Branch AssignExpr (id::e1::[]) ->
            case (eval e1 state) of
                Ok v -> 
                    case (assignVar state id v) of
                        Ok s -> Ran (update s m)
                        Err msg -> RunErr msg
                Err msg -> RunErr msg

        Branch While (cond::body::[]) -> 
            case (eval cond state) of
                Ok (Boolval True) -> Unrolled (spawnAndWait body e.code e.id e.ancestorId m)
                Ok (Boolval False) -> Ran m
                _ -> RunErr "Condition must evaluate to boolean value"

        --in the future, may need to account for if the cond contains an input (check spec for if this is possible)

        --not very space efficient to store two copies of the code

        Branch DeclareChannel ((Leaf (Ident id))::[]) -> 
            case (declareChan state (Leaf (Ident id)) (Channel id)) of
                Ok state2 -> Ran ( print ("declared " ++ id) (update state2 m))
                Err msg -> RunErr msg

        Leaf l -> RunErr "Tried to run variable"
        Branch s _ -> RunErr ("Wrong tree structure")

eval : Tree -> State -> Result String Value
eval t state =
    case t of
        Leaf (Ident "TRUE") -> Ok (Boolval True)
        --need to put this in an init state
        Leaf (Ident s) -> 
            case Dict.get s state.vars of
                Just v -> Ok v
                Nothing -> Err ("Variable " ++ s ++ " not declared")
        Leaf (Num n) -> Ok (Number n)
        Branch rule children -> Err "eval processing a tree"

assignVar : State -> Tree -> Value -> Result String State
assignVar state id v = 
    case id of
        Leaf (Ident str) -> 
            if Dict.member str state.chans then 
                Err "tried to assign to a channel" 
            else 
                Ok {state | vars = (Dict.insert str v state.vars)}
        _ -> Err "tried to assign to a number"

declareChan : State -> Tree -> Value -> Result String State
declareChan state id v = 
    case id of
        Leaf (Ident str) -> 
            if Dict.member str state.vars then 
                    Err "tried to declare a channel with a variable's name" 
                else 
                    Ok {state | vars = (Dict.insert str v state.vars)}
        _ -> Err "tried to declare, but name was a number"