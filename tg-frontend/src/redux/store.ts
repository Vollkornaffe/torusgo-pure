import {applyMiddleware, createStore} from 'redux';
import logger from 'redux-logger';
// thunk accepts functions as actions
import thunk from 'redux-thunk'
import {EConnectionStatus, ELoginState, IState} from '../types';
import reducer from './reducer';

const initialState: IState = {
  games: {
    byId: {},
    allIds: undefined,
  },
  localGame: undefined,
  users: {
    byId: {},
    allIds: undefined,
  },
  ownUserId: undefined,
  dimensions: {
    window: {
      width: 0,
      height: 0,
    },
    appBar: {
      width: 0,
      height: 0,
    },
    sideBar: {
      width: 0,
      height: 0,
    },
  },
  loginState: ELoginState.Undefined,
  connectionStatus: EConnectionStatus.Disconnected,
  activeGameId: undefined,
};

export default createStore(reducer(initialState), applyMiddleware(thunk, logger));
