import State from 'torusgo-logic';
import autoBind from 'react-autobind';
import update from 'immutability-helper';
import merge from '../utils/merge';

/**
 * @param {number} length
 * @return {string}
 */
function makeid(length = 5) {
  let text = '';
  let possible = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'
    + 'abcdefghijklmnopqrstuvwxyz0123456789';

  for (let i = 0; i < length; i++) {
    text += possible.charAt(Math.floor(Math.random() * possible.length));
  }

  return text;
}

/**
 * @class Game
 */
class Game {
  /**
   * @constructor
   * @param {object} options options
   */
  constructor(options = {}) {
    autoBind(this);

    let defaults = {
      id: makeid(),
      created: new Date(),
      x: 19,
      y: 19,
      rules: {
        komi: 5,
        handicap: 0,
        timeFormat: null,
      },
      black: {
        id: makeid(),
        score: 0,
        time: 0,
      },
      white: {
        id: makeid(),
        score: 0,
        time: 0,
      },
      phase: 'playing',
      passCounter: 0,
      states: [
        new State(options.x || 19, options.y || 19),
      ],
      scoringStates: [],
    };

    merge(this, defaults, options);
  }

  /**
   * Returns either the current {@code State} or a past {@code State} if
   * an index was given
   * @param {number} index (optional) index for the game state
   * @return {State} A game state
   */
  getState(index = this.states.length - 1) {
    return this.states[index];
  }

  /**
   * Returns either the current scoring {@code State} or a past scoring
   * {@code State} if an index was given
   * @param {number} index optional index for the game state
   * @return {State} A scoring state
   */
  getScoringState(index = this.scoringStates.length - 1) {
    return this.scoringStates[index];
  }

  /**
   * Chooses an action based on the current phase
   * @param {number} x x-coordinate
   * @param {number} y y-coordinate
   * @return {Game}
   */
  interact(x, y) {
    switch (this.phase) {
      case 'playing':
        let nextState = this.getState().makeMove(x, y);
        if (nextState !== this.getState()) {
          return update(this, {states: {$push: [nextState]}});
        }
        return this;
      case 'scoring':
        let nextScoringState = this.getScoringState().cascadingCapture(x, y);
        if (nextScoringState !== this.getScoringState()) {
          return update(this, {scoringStates: {$push: [nextScoringState]}});
        }
        return this;
      default:
        return this;
    }
  }

  /**
   * Tests the legality of an action based on the current phase
   * @param {number} x
   * @param {number} y
   * @return {boolean}
   */
  suggest(x, y) {
    switch (this.phase) {
      case 'playing':
        return this.getState().testLegal(x, y);
      case 'scoring':
        return true;
      default:
        return false;
    }
  }

  /**
   * resumes a paused game. Does nothing if the game was not paused
   * @return {Game}
   */
  resume() {
    if (this.phase === 'paused') {
      return update(this, {phase: {$set: 'playing'}});
    }
    return this;
  }

  /**
   * pauses a playing game. Does nothing if the game was not playing
   * @return {Game}
   */
  pause() {
    if (this.phase === 'playing') {
      return update(this, {phase: {$set: 'paused'}});
    }
    return this;
  }

  /**
   * Executes a pass move. On two consecutive passes, switches to scoring mode
   * @return {Game}
   */
  pass() {
    if (this.phase === 'playing') {
      let nextState = this.getState().pass();
      if (nextState !== this.getState()) {
        let updater = {
          states: {$push: [nextState]},
          passCounter: {$set: 1},
        };
        if (this.passCounter === 1) {
          updater.phase = {$set: 'scoring'};
          updater.passCounter = {$set: 2};
          updater.scoringStates = {$push: [nextState]}; // TODO is this correct?
        }
        return update(this, updater);
      }
      return this;
    }
    return this;
  }
}

export default Game;
