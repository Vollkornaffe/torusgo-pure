module Main where

import Prelude (Unit, discard, show)
import Control.Monad.Eff (Eff)
import Control.Monad.Eff.Console (CONSOLE, log)
import Data.Maybe (Maybe (Nothing, Just), fromJust)
import Data.Tuple (Tuple (Tuple))
import Partial.Unsafe (unsafePartial)

import GameLogic (State (State), Move (Play, Pass), init, toString, fromInts, group, canonPos, liberties, testLegal, makeMove, Color (Black, White))

main :: forall e. Eff (console :: CONSOLE | e) Unit
main = do
    let state = init (Tuple 3 3)
    let state'@(State s) = fromInts (Tuple 9 9) [ 0,0,0,0,0,0,0,0,0,
                                                  0,0,0,0,0,0,0,0,0,
                                                  0,0,1,2,1,0,0,0,0,
                                                  0,0,2,1,2,2,2,1,2,
                                                  0,0,2,1,2,0,2,1,2,
                                                  1,1,1,0,2,2,2,2,1,
                                                  0,0,2,1,2,0,0,2,0,
                                                  0,0,0,2,0,0,0,0,0,
                                                  0,0,0,0,0,0,0,0,0 ] 
    let state'' = state' --unsafePartial (fromJust (makeMove state' Pass))
    --log (toString state')
    --log (show (liberties state'' (Tuple 3 2)))
    --log (show (testLegal state'' (Tuple 3 5)))
    --log (show (liberties state'' (Tuple 3 4)))
    --log (show (testLegal state'' (Tuple 5 4)))

    let newState = case makeMove state'' Pass of
                    Nothing -> state''
                    Just s -> state
    let newState' = case makeMove newState (Play (Tuple 3 5) (Just White)) of
                    Nothing -> newState
                    Just s -> state

    log (toString newState)

    log (show (testLegal newState (Tuple 3 5)))
