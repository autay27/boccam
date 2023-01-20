module Model exposing (..)

import Dict exposing (Dict, empty, insert)
import List exposing (take, drop, map, member)
import Readfile exposing (Tree(..))
import State exposing (State, freshState)

type alias Id = Int
type alias IdTracker = Dict Id Bool

type alias Proc = {code: Tree, id: Id, ancestorId: Maybe Id}
type WaitCond = Terminated (List Id) | FilledChan String | EmptiedChan String
type alias WaitingProc = { proc: Proc, waitCond: WaitCond }

type alias Model = { output: String, running: (List Proc), waiting: (List WaitingProc), state: State, ids: IdTracker, display: String }

freshModel =
    { output = "",
    running = [],
    waiting = [],
    state = freshState,
    ids = Dict.empty,
    display = "" }

print : String -> Model -> Model
print s m = { m | output = m.output ++ s ++ "\n" }

update : State -> Model -> Model 
update s m = { m | state = s }

spawnAndWait : Tree -> Tree -> Id -> Maybe Id -> Model -> Model
spawnAndWait runner waiter parent ancestor m = 
    let
        (i, ids2) = getNext m.ids
        (j, ids3) = getNext ids2

        spawned_proc = { code = runner, id = i, ancestorId = Just j }

        blocked_proc = { code = waiter, id = j, ancestorId = ancestor }

        waitingproc = { proc = blocked_proc, waitCond = Terminated [i] } 
    in
        basic_spawn [spawned_proc] (block [waitingproc] (updateWaitCond parent [j] { m | ids = ids3 }))

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