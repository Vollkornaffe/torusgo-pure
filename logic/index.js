'use-strict';
let GameLogic =  require('./output/GameLogic');
let {Tuple} = require('./output/Data.Tuple');
let Maybe = require('./output/Data.Maybe');

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

module.exports = {
  init,
  makeMove,
  Black,
  White
};