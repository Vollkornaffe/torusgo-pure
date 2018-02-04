module GameLogic where

import Prelude
import Data.Maybe (Maybe (Nothing, Just), fromJust, isJust)
import Data.Tuple (Tuple (Tuple), fst, snd)
import Data.Array (range, (!!), concatMap, snoc, updateAt, filter, length, fromFoldable, nub, any, foldl, all)
import Data.String (fromCharArray)
import Partial.Unsafe (unsafePartial)
import Data.Set as Set

data Color = Black | White
type Position = Tuple Int Int
type Size = Tuple Int Int
type Field = Maybe Color

type Board = Array Field

data Move = Pass | Play Position

newtype State = State { board :: Board, size :: Size, moveNum :: Int, curCol :: Color, koPos :: Maybe Position,
                        bPrison :: Int, wPrison :: Int }
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

derive instance eqColor :: Eq Color

init :: Size -> State
init (Tuple w h) = 
    let newBoard = map (\_ -> Nothing) (range 0 (w*h-1))
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

canonPos :: Size -> Position -> Int
canonPos (Tuple w h) (Tuple x y) =
    let x_mod = mod x w
        y_mod = mod y h
        x_mod_abs = if x_mod >= 0 then x_mod else w + x_mod
        y_mod_abs = if y_mod >= 0 then y_mod else h + y_mod
    in x_mod_abs + w * y_mod_abs

canonPos2 :: Size -> Position -> Position
canonPos2 (Tuple w h) (Tuple x y) =
    let x_mod = mod x w
        y_mod = mod y h
        x_mod_abs = if x_mod >= 0 then x_mod else w + x_mod
        y_mod_abs = if y_mod >= 0 then y_mod else h + y_mod
    in Tuple x_mod_abs y_mod_abs

getField :: State -> Position -> Field
getField (State s) p = 
    let idx = canonPos s.size p
    in unsafePartial (fromJust (s.board !! idx))

setField :: State -> Field -> Position -> State
setField (State s) field p = 
    let idx = canonPos s.size p
        board' = unsafePartial (fromJust (updateAt idx field s.board))
    in State (s { board = board' })

-- carefull, this one doesn't return canonical tuples
-- consider using canonNeighPos
neighPos :: Position -> Array Position
neighPos (Tuple x y) =
    [ Tuple x (y+1),
      Tuple (x+1) y,
      Tuple x (y-1),
      Tuple (x-1) y ]

canonNeighPos :: Size -> Position -> Array Position
canonNeighPos s p = map (canonPos2 s) (neighPos p)

neighFields :: State -> Position -> Array Field
neighFields state@(State s) p = map (getField state) (canonNeighPos s.size p)

neighWithField :: State -> Field -> Position -> Array Position
neighWithField state@(State s) field p  = filter (\n -> getField state n == field) (canonNeighPos s.size p)

neighFriends :: State -> Position -> Array Position
neighFriends s p = 
    case getField s p of
        Nothing -> []
        Just color -> neighWithField s (Just color) p

neighEnemies :: State -> Position -> Array Position
neighEnemies s p = 
    case getField s p of
        Nothing -> []
        Just color -> neighWithField s (Just (flipColor color)) p

group :: State -> Position -> Array Position
group s@(State s') p =
    let setCanonP = (Set.singleton (canonPos2 s'.size p))
    in case getField s p of
        Nothing -> []
        Just color -> fromFoldable (step setCanonP setCanonP)
    where
        step mem newMem =
            let newMemArray   = fromFoldable newMem
                newNeighArray = concatMap (neighFriends s) newMemArray
                newNeighSet   = Set.fromFoldable newNeighArray
                newMem'       = Set.difference newNeighSet mem
                mem'          = Set.union mem newMem'
            in if Set.isEmpty newMem'
                then mem
                else step mem' newMem'

toString :: State -> String
toString state@(State s) = 
    let field Nothing = 'O'
        field (Just Black) = 'X'
        field (Just White) = 'Y'
        row y = map (\x -> field (getField state (Tuple x y))) (range 0 ((fst s.size)-1))
    in fromCharArray (concatMap (\y -> snoc (row y) '\n') (range 0 ((snd s.size)-1)))

flipColor :: Color -> Color
flipColor Black = White
flipColor White = Black

freeNeighPos :: State -> Position -> Array Position
freeNeighPos s p = neighWithField s Nothing p

directLiberties :: State -> Position -> Int
directLiberties s p = length ((filter ((==) Nothing)) (neighFields s p))

liberties :: State -> Position -> Maybe Int
liberties s p =
    case getField s p of 
        Nothing -> Nothing
        Just color -> (Just <<< length <<< nub <<< concatMap (freeNeighPos s)) (group s p)

testLegal :: State -> Position -> Boolean
testLegal state@(State s) p =
    getField state p == Nothing && s.koPos /= Just p &&
        (
            directLiberties state p > 0 ||
            any ((==) (Just 1)) (map (liberties state) (neighWithField state (Just (flipColor (s.curCol))) p)) ||
            any ((/=) (Just 1)) (map (liberties state) (neighWithField state (Just s.curCol) p))
        )

capture :: State -> Array Position -> State
capture state caps = 
    let foldFun state'@(State s) pos = case getField state' pos of
            Just Black -> setField (State (s { wPrison = s.wPrison + 1 })) Nothing pos
            Just White -> setField (State (s { bPrison = s.bPrison + 1 })) Nothing pos
            _ -> State s -- this should never happen
    in foldl foldFun state caps

-- executed before making the move, p to be played
captures :: State -> Position -> Field -> Array Position
captures s p (Just c) = 
    let filterFun adjPos = ((==) (Just 1)) (liberties s adjPos)
        directCaps = filter filterFun (neighWithField s (Just (flipColor c)) p)
    in nub (concatMap (group s) directCaps)
captures _ _ _ = []

-- executed before making the move, p1 to be captured, p2 to be played
testKoPos :: State -> Position -> Position -> Maybe Position
testKoPos state@(State s) p1 p2 =
    let f1 = Just (flipColor s.curCol)
        f2 = Just s.curCol
        p1_neigh = filter (\p -> canonPos s.size p /= canonPos s.size p2) (neighPos p1)
        p2_neigh = filter (\p -> canonPos s.size p /= canonPos s.size p1) (neighPos p2)
        p1_cols = map (getField state) p1_neigh
        p2_cols = map (getField state) p2_neigh
    in if all ((==) f2) p1_cols && all ((==) f1) p2_cols
        then Just p1
        else Nothing

-- pretty much the main function of the module
-- if the move is legal the resulting state is returned
-- if the move isn't legal, the given state is returned unchanged
makeMove :: State -> Move -> State
makeMove (State s) Pass = State s { moveNum = s.moveNum + 1, curCol = flipColor s.curCol, koPos = Nothing }
makeMove state@(State s) (Play p) = 
    case testLegal state p of
        true  -> setField (capture newState toBeCap) (Just s.curCol) p
        false -> state
    where toBeCap = captures state p (Just s.curCol)
          newKoPos = if length toBeCap /= 1 
            then Nothing 
            else case toBeCap !! 0 of
                Nothing -> Nothing
                Just capPos -> testKoPos state capPos p 
          newState = State s {moveNum = s.moveNum +1, curCol = flipColor s.curCol, koPos = newKoPos}

---------------------------------------------------------------------------------------------------
-- in this section, all interfacing functions are defined
-- interfacing, as in interfacing with other "normal" javascript
---------------------------------------------------------------------------------------------------

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
