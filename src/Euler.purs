module Euler where

import Prelude

import Data.List (range, filter)
import Data.Foldable (sum)

ns = range 0 999

multiplies = filter (\n -> mod n 3 == 0 || mod n 5 == 0) ns
answer = sum multiplies
