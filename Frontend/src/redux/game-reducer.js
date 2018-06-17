/**
 * @typedef {Object} GameMeta
 * @property {number} moveNumber
 * @property {string[]} observers
 * @property {string} blackId
 * @property {string} whiteId
 * @property {string} phase
 *
 *
 * @typedef {Object} GameRuleset
 * @property {number} x
 * @property {number} y
 * @property {number} komi
 * @property {number} handicap
 *
 *
 * @typedef {Object} PursState
 *
 *
 * @typedef {Object} Move
 * @property {string} type
 * @property {number} x
 * @property {number} y
 *
 *
 * @typedef {Object} Game
 * @property {GameMeta} meta
 * @property {GameRuleset} ruleset
 * @property {PursState} state
 * @property {Move[]} moveHistory
 *
 * @typedef {Object} ReduxGames
 * @property {Game} local
 * @property {string[]} allIds
 * @property {Object.<string, Game>} byId
 */

import createReducer from '../utils/create-reducer';
import update from 'immutability-helper';
import {initState, testMove, applyMove} from 'torusgo-logic';

/**
 * @param {ReduxGames} state
 * @param {action} action
 * @return {ReduxGames}
 */
function addLocalMove(state, action) {
  if (!state.local) return state;

  const {move} = action;
  const currentState = state.local.state;

  if (!testMove(currentState, move)) return state;

  // noinspection JSUnusedGlobalSymbols
  return update(state, {
    local: {
      state: {
        $set: applyMove(currentState, move),
      },
      moveHistory: {
        $push: [move],
      },
      meta: {
        moveNumber: {
          $apply: (nr) => (nr + 1),
        },
      },
    },
  });
}

/**
 * @param {ReduxGames} state
 * @param {GameRuleset} ruleset
 * @return {ReduxGames}
 */
function initLocalGame(state, {ruleset}) {
  const defaultMeta = {
    phase: 'paused',
    moveNumber: 0,
    observers: [],
    blackId: 'local.Black',
    whiteId: 'local.White',
  };

  let defaultRuleset = {
    x: 19,
    y: 19,
    komi: 5.5,
    handicap: 0,
  };

  Object.assign(defaultRuleset, ruleset);

  return update(state, {
    local: {
      $set: {
        meta: defaultMeta,
        ruleset: defaultRuleset,
        state: initState(defaultRuleset.x, defaultRuleset.y),
        moveHistory: [],
      },
    },
  });
}

const defaultState = {
  byId: null,
  allIds: [],
  local: null,
};

const reducer = createReducer(defaultState, {
  'GAME_LOCAL_ADD_MOVE': addLocalMove,
  'GAME_LOCAL_INIT': initLocalGame,
});

export default reducer;
