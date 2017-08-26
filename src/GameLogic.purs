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

newtype State = State { board :: Board, size :: Size, moveNum :: Int, currentColor :: Color }

init :: Size -> State
init (Tuple w h) = 
    let newBoard = map (\_ -> Nothing) (range 0 (w*h))
    in State {
        board: newBoard,
        size: Tuple w h, 
        moveNum: 0,
        currentColor: Black
    }

getField :: State -> Position -> Field
getField (State s) (Tuple x y) = 
    let x_mod = mod x (fst s.size)
        y_mod = mod y (snd s.size)                                                
        idx = x_mod + fst s.size * y_mod                                          
    in unsafePartial (fromJust (s.board !! idx))

setField :: State -> Field -> Position -> State
setField (State s) field (Tuple x y) = 
    let x_mod = mod x (fst s.size)
        y_mod = mod y (snd s.size)
        idx = x_mod + fst s.size * y_mod
        board' = unsafePartial (fromJust (updateAt idx field s.board))
    in State (s { board = board' })

toString :: State -> String
toString state@(State s) = 
    let field Nothing = 'O'
        field (Just Black) = 'X'
        field (Just White) = 'Y'
        row y = map (\x -> field (getField state (Tuple x y))) (range 0 (fst s.size))
    in fromCharArray (concatMap (\y -> snoc (row y) '\n') (range 0 (snd s.size)))
