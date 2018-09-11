import {applyMiddleware, createStore}   from 'redux';
import logger                           from 'redux-logger';
import {EConnectionStatus, ELoginState} from '../types/network';
import {IState}                         from '../types/redux';
import reducer                          from './reducer';

const initialState: IState = {
  resources: {
    game: {},
    user: {},
    gameList: {},
    userList: {},
  },
  localGame: undefined,
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

export default createStore(reducer(initialState), applyMiddleware(logger));
