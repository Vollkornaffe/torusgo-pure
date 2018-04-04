import {
  interface_init, interface_pass, interface_makeMove, interface_convertState,
  interface_testLegal,
} from '../lib/GameLogic';

function applyMoves(state, moves) {
  let current = state;
  for(let i = 0; i < moves.length; i++) {
    current = applyMove(current, moves[i]);
  }
  return current;
}

function applyMove(state, move) {
  switch(move.type) {
    case 'M':
      return interface_makeMove(state)(move.x)(move.y);
    case 'P':
      return interface_pass(state);
    case 'S':
      //TODO
    default:
      return state;
  }
}

function testMove(state, move) {
  switch(move.type) {
    case 'M':
      return interface_testLegal(state)(move.x)(move.y);
    case 'P':
      return true;
    case 'S':
      //TODO
    default:
      return state;
  }
}

function initState(x, y) {
  return interface_init(x)(y);
}

function convertState(state) {
  return interface_convertState(state);
}

export {
  applyMove,
  applyMoves,
  testMove,
  initState,
  convertState
};
