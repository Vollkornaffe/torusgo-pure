module GameLogic where

import Prelude
import Data.Maybe (Maybe (Nothing, Just), fromJust)
import Data.Tuple (Tuple (Tuple), fst, snd)
import Data.Array (range, (!!), concatMap, snoc, updateAt)
import Data.String (fromCharArray)
import Partial.Unsafe (unsafePartial)

data Color = Black | White
type Position = Tuple Int Int
type Size = Tuple Int Int
type Field = Maybe Color

type Board = Array Field

data Move = Pass | Play Position Field

newtype State = State { board :: Board, size :: Size, moveNum :: Int, curCol :: Color }

init :: Size -> State
init (Tuple w h) = 
    let newBoard = map (\_ -> Nothing) (range 0 (w*h))
    in State {
        board: newBoard,
        size: Tuple w h, 
        moveNum: 0,
        curCol: Black
    }

canonPos :: Size -> Position -> Int
canonPos (Tuple w h) (Tuple x y) =
    let x_mod = mod x w
        y_mod = mod y h
        x_mod_abs = if x_mod >= 0 then x_mod else w + x_mod
        y_mod_abs = if y_mod >= 0 then y_mod else w + y_mod
    in y_mod_abs + w * y_mod_abs

getField :: State -> Position -> Field
getField (State s) p = 
    let idx = canonPos s.size p
    in unsafePartial (fromJust (s.board !! idx))

setField :: State -> Field -> Position -> State
setField (State s) field p = 
    let idx = canonPos s.size p
        board' = unsafePartial (fromJust (updateAt idx field s.board))
    in State (s { board = board' })


toString :: State -> String
toString state@(State s) = 
    let field Nothing = 'O'
        field (Just Black) = 'X'
        field (Just White) = 'Y'
        row y = map (\x -> field (getField state (Tuple x y))) (range 0 (fst s.size))
    in fromCharArray (concatMap (\y -> snoc (row y) '\n') (range 0 (snd s.size)))

flipColor :: Color -> Color
flipColor Black = White
flipColor White = Black

makeMove :: State -> Move -> Maybe State
makeMove (State s) Pass = Just (State s { moveNum = s.moveNum + 1, curCol = flipColor s.curCol })
makeMove state (Play p f) = makeMove (setField state f p) Pass
