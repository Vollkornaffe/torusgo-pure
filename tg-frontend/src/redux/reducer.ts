import {Action, Reducer, ReducersMapObject}          from 'redux';
import {EGamePhase, EMoveRequestState, IRawGame, IRuleSet, TMove} from '../types/game';
import {EConnectionStatus, ELoginState}              from '../types/network';
import {IState, TAction}                             from '../types/redux';
import {EResourceStatus, EResourceType, IError}      from '../types/resource';

const changeGame = (state: IState, action: TAction<{rawGame: IRawGame}>): IState => {
  return {
    ...state,
    localGame: {
      ...state.localGame,
      rawGame: action.rawGame,
    },
  }
};

const changeConnectionStatus = (state: IState, action: TAction<{ status: EConnectionStatus }>): IState => {
  if (action.status === state.connectionStatus) {
    return state;
  }
  return {
    ...state,
    connectionStatus: action.status,
  }
};

const changeLoginState = (state: IState, action: TAction<{ status: ELoginState }>): IState => {
  if (action.status === state.loginState) {
    return state;
  }
  return {
    ...state,
    loginState: action.status,
  }
};

const changeOwnUserId = (state: IState, action: TAction<{ id?: string }>): IState => ({
  ...state,
  ownUserId: action.id,
});

const subscribeRequest = (state: IState, action: TAction<{ resourceType: EResourceType, id: string }>): IState => {
  return ({
    ...state,
    resources: {
      ...state.resources,
      [action.resourceType]: {
        ...state.resources[action.resourceType],
        [action.id]: {
          status: EResourceStatus.Loading,
        },
      },
    },
  });
};

const subscribeResponse = (state: IState, action: TAction<{ resource: any, resourceType: EResourceType, id: string }>): IState => {
  if (state.resources[action.resourceType][action.id].status
    !== EResourceStatus.Loading) {
    return state;
  }

  return {
    ...state,
    resources: {
      ...state.resources,
      [action.resourceType]: {
        ...state.resources[action.resourceType],
        [action.id]: {
          status: EResourceStatus.Loaded,
          value: action.resource,
        },
      },
    },
  };
};

const subscribeError = (state: IState, action: TAction<{ resourceType: EResourceType, id: string, err: IError }>): IState => {
  if (!state.resources[action.resourceType][action.id]) {
    return state;
  }

  return {
    ...state,
    resources: {
      ...state.resources,
      [action.resourceType]: {
        ...state.resources[action.resourceType],
        [action.id]: {
          status: EResourceStatus.Unavailable,
          error: action.err,
        },
      },
    },
  };
};

const updateResource = (state: IState, action: TAction<{ resource: any, resourceType: EResourceType, id: string }>): IState => {
  if (!state.resources[action.resourceType][action.id]) {
    return state;
  }

  return {
    ...state,
    resources: {
      ...state.resources,
      [action.resourceType]: {
        ...state.resources[action.resourceType],
        [action.id]: {
          status: EResourceStatus.Loaded,
          value: action.resource,
        },
      },
    },
  };
};

// TODO don't handle keydowns/ups via redux
const updateKeyPress = (state: IState, action: TAction<{ keyCode: string, pressed: boolean }>): IState => {
  if (action.pressed) {
    // keydown
    const idx = state.pressedKeys.indexOf(action.keyCode);
    if (idx > -1) {
      // is already down
      return state;
    } else {
      // add to pressed keys
      return {
        ...state,
        pressedKeys: [...state.pressedKeys, action.keyCode],
      };
    }
  } else {
    // keyup
    // just run a filter on the pressed keys
    return {
      ...state,
      pressedKeys: state.pressedKeys.filter(keyCode => keyCode !== action.keyCode),
    };
  }
};

function createReducer<S>(initialState: S, reducerObject: ReducersMapObject): Reducer<S> {
  return (state = initialState, action: Action) => {
    if (reducerObject.hasOwnProperty(action.type)) {
      return reducerObject[action.type](state, action);
    }
    return state;
  };
}

export default <S>(initialState: S) => createReducer(initialState, {
  'CHANGE_RAW_GAME': changeGame,

  'CONNECTION_STATUS_CHANGE': changeConnectionStatus,
  'LOGIN_STATE_CHANGE': changeLoginState,

  'OWN_USER_ID_CHANGE': changeOwnUserId,

  'RESOURCE_UPDATE': updateResource,

  'SUBSCRIBE_REQUEST': subscribeRequest,
  'SUBSCRIBE_RESPONSE': subscribeResponse,
  'SUBSCRIBE_ERROR': subscribeError,

  'KEY_PRESS_UPDATE': updateKeyPress, // TODO keys are not to be in the store
});