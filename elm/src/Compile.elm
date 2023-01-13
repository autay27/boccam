module Compile exposing (..)

import Dict exposing (Dict, empty, insert)
import List exposing (head, take, drop, map, member, filter)
import Readfile exposing (Tree(..), TreeValue(..), Rule(..))

--example_tree = Branch Seq [Branch ProcList [Branch Out [Leaf (Ident "chan"), Leaf (Num 0)], Branch Out [Leaf (Ident "chan"), Leaf (Num 1)]]]

example_tree = Branch Seq [Branch ProcList[
    Branch DeclareChannel [Leaf (Ident "chan")], 
    Branch Seq [Branch ProcList 
        [Branch While [Leaf (Ident "TRUE"), Branch Out [Leaf (Ident "chan"), Leaf (Num 1)]],
        Branch While [Leaf (Ident "TRUE"), Branch Out [Leaf (Ident "chan"), Leaf (Num 0)]]]]]]

-- simulating program

type WaitCond = Terminated (List Id) | PlchldWait

type Outcome a b c = RunErr a | Ran b | Blocked c

type Value = Number Int | Channel String | Boolval Bool

type alias Chan = { inUse: Bool, value: Value, lastUser: Id }

type alias State = Dict String Value

type alias Id = Int
type alias IdTracker = Dict Id Bool

type alias Proc = {code: Tree, id: Id, ancestorId: Maybe Id}

type alias WaitingProc = { proc: Proc, waitCond: WaitCond }

type alias Model = { output: String, running: (List Proc), waiting: (List WaitingProc), state: State, ids: IdTracker }

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

--        case unblocked of
--            (x::xs) -> Ok (print ("unblocking " ++ (String.fromInt (x.proc.id)) ++ " which was waiting for " ++ (String.fromInt id)) (basic_spawn unblockedProcs { m | waiting = stillWaiting }))
--            _ -> Ok (basic_spawn unblockedProcs { m | waiting = stillWaiting })


-- we can also remove i from m.ids here

step : Proc -> Model -> Outcome String Model WaitCond
step e m = let state = m.state in
    case e.code of

        Branch Par (x::[]) ->
            case x of
                Branch ProcList ys -> Ran (spawn ys e.id e.ancestorId m)
                _ -> RunErr "PAR rule must be followed by process list only"

        Branch Seq (x::[]) ->
            case x of 
                Branch ProcList [] -> Ran m
                Branch ProcList (y::ys) -> 
                    Ran (spawnAndWait y (Branch Seq [Branch ProcList ys]) e.id e.ancestorId m)
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
                    case (assign state id v) of
                        Ok s -> Ran (update s m)
                        Err msg -> RunErr msg
                Err msg -> RunErr msg

        Branch While (cond::body::[]) -> 
            case (eval cond state) of
                Ok (Boolval True) -> Ran (spawnAndWait body e.code e.id e.ancestorId m)
                Ok (Boolval False) -> Ran m
                _ -> RunErr "Condition must evaluate to boolean value"

        --in the future, may need to account for if the cond contains an input (check spec for if this is possible)

        --not very space efficient to store two copies of the code

        Branch DeclareChannel ((Leaf (Ident id))::[]) -> 
            case (assign state (Leaf (Ident id)) (Channel id)) of
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
            case Dict.get s state of
                Just v -> Ok v
                Nothing -> Err ("Variable " ++ s ++ " not declared")
        Leaf (Num n) -> Ok (Number n)
        Branch rule children -> Err "eval processing a tree"

assign : State -> Tree -> Value -> Result String State
assign state id v = 
    case id of
        Leaf (Ident str) -> Ok (Dict.insert str v state)
        _ -> Err "tried to assign to a number"

freshModel = { output = "",
                running = [],
                waiting = [],
                state = Dict.empty,
                ids = Dict.empty }

print : String -> Model -> Model
print s m = { m | output = m.output ++ s ++ "\n" }

update : State -> Model -> Model 
update s m = { m | state = s }

spawnAndWait : Tree -> Tree -> Id -> Maybe Id -> Model -> Model
spawnAndWait runner waiter parent ancestor m = 
    let
        (i, ids2) = getNext m.ids
        blocked_proc = { code = waiter, id = i, ancestorId = ancestor }

        (j, ids3) = getNext ids2
        spawned_proc = { code = runner, id = j, ancestorId = Just i }

        waitingproc = { proc = blocked_proc, waitCond = Terminated [j] } 
    in
        basic_spawn [spawned_proc] (block [waitingproc] (updateWaitCond parent [i] { m | ids = ids3 }))
--        case ancestor of 
--            Just n -> print ("tried to update cond of " ++ (String.fromInt n) ++ " with " ++ (String.fromInt i)) (basic_spawn [spawned_proc] (block [waitingproc] (updateWaitCond parent [i] { m | ids = ids3 })))
--            _ -> basic_spawn [spawned_proc] (block [waitingproc] (updateWaitCond parent [i] { m | ids = ids3 }))



spawn : (List Tree) -> Id -> Maybe Id -> Model -> Model
spawn xs parent ancestor m = 
    let 
        (newprocs, d) = assignIds xs ancestor m.ids
        m2 = basic_spawn newprocs { m | ids = d }
    in 
        updateWaitCond parent (map (\p -> p.id) newprocs) m2

updateWaitCond : Id -> List Id -> Model -> Model
updateWaitCond parent children m = 
        let
            updated_waiting = map (\p -> case p.waitCond of 
                Terminated xs -> if List.member parent xs then { p | waitCond = Terminated (children ++ xs) } else p
                _ -> p) m.waiting
        in 
            { m | waiting = updated_waiting }

--            print ("searched for conds with " ++ String.fromInt parent ++ ", updated how many cond: " ++ String.fromInt (List.length (List.filter (\p -> case p.waitCond of
--                Terminated xs -> List.member parent xs
--                _ -> False) m.waiting))) { m | waiting = updated_waiting }

basic_spawn : (List Proc) -> Model -> Model 
basic_spawn xs m = { m | running = xs ++ m.running }

assignIds : List Tree -> Maybe Id -> IdTracker -> (List Proc, IdTracker)
assignIds trees ancestor dict = 
        case trees of 
            [] -> ([], dict)
            (t::ts) -> 
                let (xs, d) = assignIds ts ancestor dict in
                    let (i, dict2) = getNext d in
                        ({code = t, id = i, ancestorId = ancestor}::xs, dict2)

getNext : IdTracker -> (Id, IdTracker)
getNext dict = 
    let 
        getNext2 d n = if Dict.member n d then getNext2 d (n+1) else (n, (insert n True d))
    in
        getNext2 dict 0

block : (List WaitingProc) -> Model -> Model 
block xs m = { m | waiting = xs ++ m.waiting }