// this is the part connecting the otherwise pure/unknowing GameLogic to the
// rest of the application, this enables testing of the isolated GameLogic

import {IPosition} from "../types/game";

// tests the legality of the intended move without applying it
export const testLegal = (
  move: IPosition,
): boolean => {

  const rawGame = store.getState().localGame.rawGame;

  const legal = testPosition(
    rawGame.ruleSet.size,
    rawGame.board,
    rawGame.koPosition,
    rawGame.toMove,
    move);

  return legal;
};