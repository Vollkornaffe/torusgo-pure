import GameLogic from './output/GameLogic';
import {Tuple} from './output/Data.Tuple';
import Maybe from './output/Data.Maybe';

function Black () {
  return new GameLogic.Black
}

function White () {
  return new GameLogic.White
}

function init(x, y) {
  let t = new Tuple(x,y);

  return GameLogic.init(t);
}

function makeMove(state, x,y,color) {
  let t = new Tuple(x,y);
  let play = new GameLogic.Play(t, new Maybe.Just(color));

  let maybe = GameLogic.makeMove(state)(play);

  if(maybe instanceof Maybe.Just) {
    return maybe.value0;
  } else {
    return null;
  }
}

export default {
  init,
  makeMove,
  Black,
  White
};