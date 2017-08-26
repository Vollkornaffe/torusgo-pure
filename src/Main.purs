module Main where

import Prelude (Unit, discard, show)
import Control.Monad.Eff (Eff)
import Control.Monad.Eff.Console (CONSOLE, log)

import GameLogic (State (State), init, toString, fromInts, group, canonPos, liberties)
import Data.Tuple (Tuple (Tuple))

main :: forall e. Eff (console :: CONSOLE | e) Unit
main = do
    let state = init (Tuple 3 3)
    let state'@(State s) = fromInts (Tuple 9 9) [ 0,0,0,0,0,0,0,0,0,
                                                  0,0,0,0,0,0,0,0,0,
                                                  0,0,0,2,2,0,0,0,0,
                                                  0,0,0,0,2,2,2,1,2,
                                                  0,0,0,0,0,0,2,1,2,
                                                  1,1,1,0,0,0,2,2,1,
                                                  0,0,0,0,0,0,0,2,0,
                                                  0,0,0,0,0,0,0,0,0,
                                                  0,0,0,0,0,0,0,0,0 ] 
    log (toString state')
    log (show (liberties state' (Tuple 3 2)))
