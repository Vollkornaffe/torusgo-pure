import {applyMiddleware, createStore}   from 'redux';
import logger                           from 'redux-logger';
import {EColor, EGamePhase, EMoveRequestState, IGame,} from "../types/game";
import {EConnectionStatus, ELoginState} from '../types/network';
import {IState}                         from '../types/redux';
import reducer                          from './reducer';

import {initGame} from "../utils/game-logic";

const defaultRuleSet = {
  size: {
    x: 12,
    y: 18,
  },
  komi: 5.5,
  handicap: 0,
};

const welcomeGame = {
  phase: EGamePhase.Running,
  moveNumber: 0,
  moveHistory: [],
  rawGame: initGame(defaultRuleSet),
};

const initialState: IState = {
  resources: {
    game: {},
    user: {},
    gameList: {},
    userList: {},
  },
  localGame: welcomeGame,
  ownUserId: undefined,
  loginState: ELoginState.Undefined,
  connectionStatus: EConnectionStatus.Disconnected,
  activeGameId: undefined,

  pressedKeys: [],
  controlKeys: {
    up: 'KeyW',
    down: 'KeyS',
    left: 'KeyA',
    right: 'KeyD',
    twistIn: 'KeyQ',
    twistOut: 'KeyE',
    mouseControl: 'ControlLeft',
  },
  cameraDelta: 0.3,
  twistDelta: 0.05,

};

// export default createStore(reducer(initialState), applyMiddleware(logger));
export default createStore(reducer(initialState));
