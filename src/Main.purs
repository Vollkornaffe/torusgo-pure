module Main where

import Prelude (Unit)
import Control.Monad.Eff (Eff)
import Control.Monad.Eff.Console (CONSOLE, log)

import GameLogic (init, toString)
import Data.Tuple (Tuple (Tuple))

main :: forall e. Eff (console :: CONSOLE | e) Unit
main = do
    let state = init (Tuple 3 3)
    log (toString state)
