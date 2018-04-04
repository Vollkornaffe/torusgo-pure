'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.convertState = exports.initState = exports.testMove = exports.applyMoves = exports.applyMove = undefined;

var _GameLogic = require('../lib/GameLogic');

function applyMoves(state, moves) {
  var current = state;
  for (var i = 0; i < moves.length; i++) {
    current = applyMove(current, moves[i]);
  }
  return current;
}

function applyMove(state, move) {
  switch (move.type) {
    case 'M':
      return (0, _GameLogic.interface_makeMove)(state)(move.x)(move.y);
    case 'P':
      return (0, _GameLogic.interface_pass)(state);
    case 'S':
    //TODO
    default:
      return state;
  }
}

function testMove(state, move) {
  switch (move.type) {
    case 'M':
      return (0, _GameLogic.interface_testLegal)(state)(move.x)(move.y);
    case 'P':
      return true;
    case 'S':
    //TODO
    default:
      return state;
  }
}

function initState(x, y) {
  return (0, _GameLogic.interface_init)(x)(y);
}

function convertState(state) {
  return (0, _GameLogic.interface_convertState)(state);
}

exports.applyMove = applyMove;
exports.applyMoves = applyMoves;
exports.testMove = testMove;
exports.initState = initState;
exports.convertState = convertState;