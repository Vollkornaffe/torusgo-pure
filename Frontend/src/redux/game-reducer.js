import createReducer from '../utils/create-reducer';
import update from 'immutability-helper';
import {initState, testMove, applyMove} from 'torusgo-logic';

const defaultState = {
  byId: {},
  allIds: [],
};

const defaultMeta = {
  x: 19,
  y: 19,
  komi: 5.5,
  handicap: 0,
  phase: 'paused',
  moveNumber: 0,
  observers: [],
  blackId: '',
  whiteId: '',
};


/**
 * @param {ReadonlyArray<any>} state
 * @param {action} action
 * @return {ReadonlyArray<any>}
 */
function addGame(state, action) {
  const {id, rules, blackId, whiteId} = action;

  if (!state.byId.hasOwnProperty(id)) {
    const meta = Object.assign(defaultMeta, rules, {blackId}, {whiteId});
    const details = {
      currentState: initState(meta.x, meta.y),
      moveHistory: [],
    };
    return update(state, {
      byId: {
        [id]: {$set: {id, meta, details}},
      },
      allIds: {
        $push: [id],
      },
    });
  }

  return state;
}

/**
 * @param {ReadonlyArray<any>} state
 * @param {action} action
 * @return {ReadonlyArray<any>}
 */
function addMove(state, action) {
  const {id, move} = action;
  if (!state.byId[id]) return state;

  const {currentState} = state.byId[id].details;
  if (testMove(currentState, move)) {
    return update(state, {
      byId: {
        [id]: {
          details: {
            currentState: {
              $set: applyMove(currentState, move),
            },
            moveHistory: {
              $push: [move],
            },
          },
          meta: {
            moveNumber: {
              $apply: (nr) => nr + 1,
            },
          },
        },
      },
    });
  }

  return state;
}

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
 * @param {ReadonlyArray<any>} state
 * @param {action} action
 * @return {ReadonlyArray<any>}
 */
function addDefaultGame(state, action) {
  const id = makeid();
  const blackId = 'default';
  const whiteId = 'default';

  if (!state.byId.hasOwnProperty(id)) {
    const meta = Object.assign(defaultMeta, {blackId}, {whiteId});
    const details = {
      currentState: initState(meta.x, meta.y),
      moveHistory: [],
    };
    return update(state, {
      byId: {
        [id]: {$set: {id, meta, details}},
      },
      allIds: {
        $push: [id],
      },
    });
  }

  return state;
}

const reducer = createReducer(defaultState, {
  'GAME_ADD': addGame,
  'GAME_ADD_DEFAULT': addDefaultGame,
  'GAME_ADD_MOVE': addMove,
});

export default reducer;
