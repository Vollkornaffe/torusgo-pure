import {applyMiddleware, createStore} from 'redux';
import logger from 'redux-logger';
import {EConnectionState, ELoginState, IState} from '../types';
import reducer from './reducer';

const initialState: IState = {
  games: {
    byId: {},
    allIds: [],
  },
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
  connectionState: EConnectionState.Disconnected,
  activeGameId: null,
};

export default createStore(reducer(initialState), applyMiddleware(logger));
