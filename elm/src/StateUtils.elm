module StateUtils exposing (..)


treeToId : Tree -> Result String Identifier
treeToId tree =
    case tree of
        Branch Id [(Leaf (Ident i)), Branch Dimensions ds] ->
            Ok { str = i, dims = ds }
        Branch DeclareChannel [Branch Dimensions ds, (Leaf (Ident i))] ->
            Ok { str = i, dims = ds }
        Branch DeclareVariable [Branch Dimensions ds, (Leaf (Ident i))] ->
            Ok { str = i, dims = ds }
        _ -> Err "Problem with identifier parsing"

        
makeChanArray : List Int -> ChanStorage
makeChanArray dimensions =
    case dimensions of
        [] -> ChanSingle freshChannel
        (x::xs) -> ChanArray (List.foldr (\d -> insert d (makeChanArray xs)) Dict.empty (List.range 0 (x-1)))

makeVarArray : List Int -> ChanStorage
makeVarArray dimensions =
    case dimensions of
        [] -> Any
        (x::xs) -> Array (List.foldr (\d -> insert d (makeVarArray xs)) Dict.empty (List.range 0 (x-1)))

accessChannel : String -> List Int -> State -> Result String Chan
accessChannel str dims state =
    let indexIntoArray ds dict = case List.head ds of
            Nothing -> Err ("Not enough indexes for array " + str)
            Just d -> case Dict.get d dict of
                Just (ChanSingle ch) -> if List.length ds == 1 then Ok ch else Err ("Too many indexes for array " ++ str)
                Just (ChanArray arr) -> indexIntoArray str (List.tail ds) arr
                Nothing -> Err ("Index " ++ (String.fromInt d) ++ " out of bounds for " ++ str)
    in
        case Dict.get str state.chans of
            Just (ChanSingle ch) -> if List.length dims == 0 then Ok ch else Err (str ++ " is not an array but indexes given")
            Just (ChanArray dict) -> indexIntoArray dims dict
            Nothing -> Err "Channel not declared"

-- Returns a pair with the current value of the variable, and the state were it to be updated to the given value
derefAndUpdateVariable : Value -> String -> List Int -> State -> Result String (Value, State)
derefAndUpdateVariable val str dims state =
    let dAUArray val d ds dict =
        case List.head ds of
            Nothing -> case Dict.get d dict of
                Just (Array _) -> Err ("Not enough indexes for array " ++ str)
                Just oldvalue -> Ok (oldvalue, Dict.insert d val dict)
                Nothing -> Err "Index out of bounds"
            Just i -> case Dict.get d dict of
                Just (Array dict2) -> 
                    dAUArray val i (List.tail ds) dict2 |> Result.andThen (\(oldvalue, newstruct) ->
                        Ok (oldvalue, update d newstruct dict)
                    )
                Just oldvalue -> Err ("Too many indexes for array " ++ str)
                Nothing -> Err "Index out of bounds"
    in
        case Dict.get str state.vars of
            Nothing -> Err "Variable not declared"
            Just (Array dict) -> case dims of 
                (d::ds) -> 
                    let (accessedvalue, updatedvars) = dAUArray val d ds state.vars in
                    Ok (accessedvalue, {state | state.vars = updatedvars })
                _ -> Err ("Not enough indices for array " ++ str)
            Just accessedvalue -> case dims of
                [] -> Ok (accessedvalue, {state | state.vars = Dict.update str val state.vars})
                _ -> Err ("Too many indexes for array " ++ str)

            