module GameLogic where

import Prelude (class Eq, class Ord, map, mod, (*), (+), (-), (/), (<<<), (>), (>=), (==), (/=), (&&), (||))
import Data.Maybe (Maybe (Nothing, Just), fromJust, isJust)
import Data.Tuple (Tuple (Tuple), fst, snd)
import Partial.Unsafe (unsafePartial)
import Data.String (fromCharArray)

import Data.Array as Array
import Data.Set as Set
import Data.Foldable (foldl)

data Color = Black | White
type Position = Tuple Int Int
type Size = Tuple Int Int
type Field = Maybe Color

type Board = Array Field

data Move = Pass | Play Position

newtype State = State {
    board :: Board,
    size :: Size,
    moveNum :: Int,
    curCol :: Color,
    koPos :: Maybe Position,
    bPrison :: Int,
    wPrison :: Int }

derive instance eqColor :: Eq Color
derive instance ordColor :: Ord Color

---------------------------------------------------------------------------------------------------
-- First some auxiliary functions to deal with Sets
---------------------------------------------------------------------------------------------------

setFilter :: forall a. Ord a => (a -> Boolean) -> Set.Set a -> Set.Set a
setFilter filter set =
    let f newSet oldElem = if filter oldElem
            then Set.insert oldElem newSet
            else newSet
    in  foldl f Set.empty set

getSingleton :: forall a. Ord a => Set.Set a -> Maybe a
getSingleton set = if Set.size set == 1
    then Set.findMin set
    else Nothing
    

setAll :: forall a. Ord a => (a -> Boolean) -> Set.Set a -> Boolean
setAll test set =
    let array_version = Array.fromFoldable set
    in  Array.all test array_version


setAny :: forall a. Ord a => (a -> Boolean) -> Set.Set a -> Boolean
setAny test set =
    let array_version = Array.fromFoldable set
    in  Array.any test array_version



---------------------------------------------------------------------------------------------------
-- In this first section, core functionality is implemented
---------------------------------------------------------------------------------------------------

init :: Size -> State
init (Tuple w h) =
    let newBoard = map (\_ -> Nothing) (Array.range 0 (w*h-1))
    in State {
        board: newBoard,
        size: Tuple w h,
        moveNum: 0,
        curCol: Black,
        koPos: Nothing,
        bPrison: 0,
        wPrison: 0
    }

fromInts :: Size -> Array Int -> State
fromInts size as =
    let board = map field as
    in State {
        board: board,
        size: size,
        moveNum: 0,
        curCol: Black,
        koPos: Nothing,
        bPrison: 0,
        wPrison: 0
    }
    where field i = case i of
            1 -> Just Black
            2 -> Just White
            _ -> Nothing

getIdx :: Size -> Position -> Int
getIdx (Tuple w h) (Tuple x y) =
    let x_mod = mod x w
        y_mod = mod y h
        x_mod_abs = if x_mod >= 0 then x_mod else w + x_mod
        y_mod_abs = if y_mod >= 0 then y_mod else h + y_mod
    in x_mod_abs + w * y_mod_abs

canonPos :: Size -> Position -> Position
canonPos (Tuple w h) (Tuple x y) =
    let x_mod = mod x w
        y_mod = mod y h
        x_mod_abs = if x_mod >= 0 then x_mod else w + x_mod
        y_mod_abs = if y_mod >= 0 then y_mod else h + y_mod
    in Tuple x_mod_abs y_mod_abs

getPos :: Size -> Int -> Position
getPos size@(Tuple w h) idx =
    let x = mod idx w
        y = idx / h
    in  canonPos size (Tuple x y)

getField :: State -> Position -> Field
getField (State s) p =
    let idx = getIdx s.size p
    in unsafePartial (fromJust (s.board Array.!! idx))

setField :: State -> Field -> Position -> State
setField (State s) field p =
    let idx = getIdx s.size p
        board' = unsafePartial (fromJust (Array.updateAt idx field s.board))
    in State (s { board = board' })

neighPos :: Size -> Position -> Set.Set Position
neighPos size (Tuple x y) =
    let neighsAsArray = [ Tuple x (y+1), Tuple (x+1) y, Tuple x (y-1), Tuple (x-1) y ]
    in  Set.map (canonPos size) (Set.fromFoldable neighsAsArray)

neighFields :: State -> Position -> Set.Set Field
neighFields state@(State s) p = Set.map (getField state) (neighPos s.size p)

neighWithField :: State -> Field -> Position -> Set.Set Position
neighWithField state@(State s) field p  = setFilter (\n -> getField state n == field) (neighPos s.size p)

flipColor :: Color -> Color
flipColor Black = White
flipColor White = Black

freeNeighPos :: State -> Position -> Set.Set Position
freeNeighPos s p = neighWithField s Nothing p

neighFriends :: State -> Position -> Set.Set Position
neighFriends s p =
    case getField s p of
        Nothing -> Set.empty
        Just color -> neighWithField s (Just color) p

neighEnemies :: State -> Position -> Set.Set Position
neighEnemies s p =
    case getField s p of
        Nothing -> Set.empty
        Just color -> neighWithField s (Just (flipColor color)) p

-- finds all members of the position
-- also finds connected empty regions
group :: State -> Position -> Set.Set Position
group state@(State s) p =
    let startSet = (Set.singleton (canonPos s.size p))
        field = getField state p
    in  groupRecursion field startSet startSet
    where -- uses a breadth first search
          -- members are the allready deduced members of the group
          -- inWork is a subset of members, they may have neighbors which are undiscovered members
          groupRecursion :: Field -> Set.Set Position -> Set.Set Position -> Set.Set Position
          groupRecursion field members inWork = if Set.isEmpty inWork
              then members
              else let potentialNew = Set.unions (Set.map (neighWithField state field) inWork)
                       confirmedNew = Set.difference potentialNew members
                   in  groupRecursion field (Set.union members confirmedNew) confirmedNew

toString :: State -> String
toString state@(State s) =
    let field Nothing = 'O'
        field (Just Black) = 'X'
        field (Just White) = 'Y'
        row y = map (\x -> field (getField state (Tuple x y))) (Array.range 0 ((fst s.size)-1))
    in fromCharArray (Array.concatMap (\y -> Array.snoc (row y) '\n') (Array.range 0 ((snd s.size)-1)))

directLiberties :: State -> Position -> Int
directLiberties s p = Set.size ((setFilter ((==) Nothing)) (neighFields s p))

-- returns liberty count of a connected group of black or white
liberties :: State -> Position -> Int
liberties s = Set.size <<< Set.unions <<< Set.map (freeNeighPos s) <<< group s

-- test whether it would be legal for the current player to play at given position
-- must be free (duh)
-- AND not ko
-- AND must EITHER 
--       have one direct liberty 
--    OR connect to a friendly group with more than 1 liberty
--    OR capture an enemy group
testLegal :: State -> Position -> Boolean
testLegal state@(State s) p =
    getField state p == Nothing && s.koPos /= Just p &&
        (
            directLiberties state p > 0 ||
            setAny ((==) 1) (Set.map (liberties state) (neighWithField state (Just (flipColor (s.curCol))) p)) ||
            setAny ((/=) 1) (Set.map (liberties state) (neighWithField state (Just s.curCol) p))
        )

-- more like an auxiliary function, the set of captures is computed in the parent scope
capture :: State -> Set.Set Position -> State
capture state caps =
    let foldFun state'@(State s) pos = case getField state' pos of
            Just Black -> setField (State (s { wPrison = s.wPrison + 1 })) Nothing pos
            Just White -> setField (State (s { bPrison = s.bPrison + 1 })) Nothing pos
            _ -> State s -- this should never happen
    in foldl foldFun state caps

-- pretty much the main function of the module
-- if the move is legal the resulting state is returned
-- if the move isn't legal, the given state is returned unchanged
makeMove :: State -> Move -> State
makeMove (State s) Pass = State s { moveNum = s.moveNum + 1, curCol = flipColor s.curCol, koPos = Nothing }
makeMove state@(State s) (Play p) =
    case testLegal state p of
        true  ->
            let toBeCaptured = captures (flipColor s.curCol)
                newKoPos = case getSingleton toBeCaptured of
                    Just potentialKoPos -> testKoPos potentialKoPos
                    Nothing -> Nothing
                s_beforeCapture = State s {moveNum = s.moveNum +1, curCol = flipColor s.curCol, koPos = newKoPos}
                s_afterCapture = capture s_beforeCapture toBeCaptured
            in  setField s_afterCapture (Just s.curCol) p
        false -> state
    where -- all neighboring groups with the given color and 1 liberty are returned
          -- executed after testLegal returned true and before making the move at the given position
          captures :: Color -> Set.Set Position
          captures c =
              let filterFun nPos = ((==) 1) (liberties state nPos)
                  directCaps = setFilter filterFun (neighWithField state (Just c) p)
              in Set.unions (Set.map (group state) directCaps)
          -- executed before making the move, p' to be captured, p to be played
          testKoPos :: Position -> Maybe Position
          testKoPos p' =
              let field    = Just s.curCol
                  field'   = Just (flipColor s.curCol)
                  p_neigh  = setFilter (\n -> n /= p') (neighPos s.size p)
                  p'_neigh = setFilter (\n -> n /= p) (neighPos s.size p')
                  p_cols   = Set.map (getField state) p_neigh
                  p'_cols  = Set.map (getField state) p'_neigh
              in if setAll ((==) field) p'_cols 
                 && setAll ((==) field') p_cols
                  then Just p'
                  else Nothing

---------------------------------------------------------------------------------------------------
-- in this section, functions for scoring are defined
---------------------------------------------------------------------------------------------------

directCapture :: State -> Position -> State
directCapture s p =
    case getField s p of
        Nothing -> s
        _       -> capture s (group s p)

searchNeighColor :: State -> Color -> Set.Set Position -> Boolean
searchNeighColor s c = Set.member (Just c) <<< Set.unions <<< Set.map (neighFields s)

markEmpty :: State -> Board
markEmpty state@(State {size: size@(Tuple w h)}) =
    let allPos = map (getPos size) (Array.range 0 (w*h-1))
        allEmpty = setFilter (\p -> getField state p == Nothing) (Set.fromFoldable allPos)
        initMarks = map (\_ -> Nothing) allPos
    in markRemaining initMarks allEmpty
    where checkSurround :: Set.Set Position -> Field
          checkSurround eg = 
            case Tuple (searchNeighColor state Black eg) (searchNeighColor state White eg) of
                Tuple true false -> Just Black
                Tuple false true -> Just White
                _                -> Nothing
          markRemaining :: Board -> Set.Set Position -> Board
          markRemaining marks inWork = case Set.findMin inWork of 
            Nothing -> marks
            Just p -> let emptyGroup = group state p
                          resultForGroup = checkSurround emptyGroup
                          updatedMarks = foldl
                            (\ms mp -> unsafePartial (fromJust (Array.updateAt (getIdx size mp) resultForGroup ms)))
                            marks
                            emptyGroup
                          remaining = Set.difference inWork emptyGroup 
                      in  markRemaining updatedMarks remaining

computeScore :: State -> Board -> Tuple Int Int
computeScore (State s) board =
    let f (Tuple wScore bScore) (Just Black) = Tuple wScore (bScore+1)
        f (Tuple wScore bScore) (Just White) = Tuple (wScore+1) bScore
        f score _ = score
    in  foldl f (Tuple s.bPrison s.wPrison) board

---------------------------------------------------------------------------------------------------
-- in this section, all interfacing functions are defined
-- interfacing, as in interfacing with other "normal" javascript
---------------------------------------------------------------------------------------------------

newtype Interface_Tuple = Interface_Tuple { x :: Int, y :: Int }
newtype Interface_State = Interface_State {
    board :: Array Int,
    size :: Interface_Tuple,
    moveNum :: Int,
    curCol :: Int,
    ko :: Boolean,
    koPos :: Interface_Tuple,
    bPrison :: Int,
    wPrison :: Int }

-- converting field maybe value to common data type int
-- just an internal helping function
convertColor :: Color -> Int
convertColor Black = 1
convertColor White = 2

convertField :: Field -> Int
convertField Nothing = 0
convertField (Just c) = convertColor c

-- for initializing the state
interface_init :: Int -> Int -> State
interface_init x_seg y_seg = init (Tuple x_seg y_seg)


-- testing whether a move is legal
interface_testLegal :: State -> Int -> Int -> Boolean
interface_testLegal s x y = testLegal s (Tuple x y)

-- passing
interface_pass :: State -> State
interface_pass s = makeMove s Pass

-- making a move
interface_makeMove :: State -> Int -> Int -> State
interface_makeMove s x y = makeMove s (Play (Tuple x y))

-- directly capturing a group
interface_directCapture :: State -> Int -> Int -> State
interface_directCapture s x y = directCapture s (Tuple x y)

interface_markEmpty :: State -> Array Int
interface_markEmpty = (map convertField) <<< markEmpty

interface_computeScore :: State -> Interface_Tuple
interface_computeScore s =
    let marks = markEmpty s
        Tuple bScore wScore = computeScore s marks
    in  Interface_Tuple { x: bScore, y: wScore }

-- converting the state to an ordinary JSON object
interface_convertState :: State -> Interface_State
interface_convertState (State s) =
    let boardInInts = map convertField s.board
        Tuple size_x size_y = s.size
        unpackKo Nothing = Interface_Tuple {x: 0, y: 0}
        unpackKo (Just (Tuple x y)) = Interface_Tuple {x: x, y: y}
        koPos = unpackKo s.koPos
        ko = isJust s.koPos
    in Interface_State {
        board: boardInInts,
        size: Interface_Tuple { x: size_x, y: size_y},
        moveNum: s.moveNum,
        curCol: convertColor s.curCol,
        ko: ko,
        koPos: koPos,
        bPrison: s.bPrison,
        wPrison: s.wPrison
    }
