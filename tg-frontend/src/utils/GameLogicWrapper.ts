// this is the part connecting the otherwise pure/unknowing GameLogic to the
// rest of the application, this enables testing of the isolated GameLogic

import {makeMove, testPosition} from "./GameLogic";

import {changeGame} from "../redux/actions";
import store from "../redux/store";

import {IPosition} from "../types/game";


// tests the legality of the intended move without applying it
export function testLegal(
  move: IPosition,
): boolean {

  const rawGame = store.getState().localGame.rawGame;

  return testPosition(
    rawGame.ruleSet.size,
    rawGame.board,
    rawGame.koPosition,
    rawGame.toMove,
    move);
}

export function execMove(
  move: IPosition,
): void {

  const rawGame = store.getState().localGame.rawGame;

  if(testPosition(
    rawGame.ruleSet.size,
    rawGame.board,
    rawGame.koPosition,
    rawGame.toMove,
    move)
  ) {
    changeGame(makeMove(rawGame, {type: "Move", x: move.x, y: move.y}));
  }
}
