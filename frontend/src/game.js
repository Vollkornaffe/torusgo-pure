import {State} from 'torusgo-logic';

const PAUSE = 0;

class Game {
  constructor(playerB, playerW) {
    this.scoringStates = [];
    this.states = [];
    this.black = {
      user: playerB,
      score: 0,
      time: 0
    };
    this.white = {
      user: playerW,
      score: 0,
      time: 0
    };
    this.rules = {
      komi: 0,
      handicap: 0,
      timeFormat: null
    };

    this.timeCreated = null;
    this.phase = PAUSE;
  }
}


export default Game;