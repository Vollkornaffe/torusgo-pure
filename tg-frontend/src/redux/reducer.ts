import {Action, Reducer, ReducersMapObject} from 'redux';
import {EColor, EField, EGamePhase, IRuleSet, TMove} from '../types/game';
import {EConnectionStatus, ELoginState} from '../types/network';
import {IState, TAction} from '../types/redux';
import {EResourceStatus, EResourceType, IError,} from '../types/resource';
import {IDimension, TResizable} from '../types/ui';
import {applyMove, testMove} from '../utils/game-logic';

const resize = (element: TResizable) => (state: IState, action: TAction<IDimension>): IState => {
  if (action.width === state.dimensions[element].width
    && action.height === state.dimensions[element].height) {
    return state;
  }

  return {
    ...state,
    dimensions: {
      ...state.dimensions,
      [element]: {
        width: action.width,
        height: action.height,
      },
    },
  };
};

const initLocalGame = (state: IState, action: TAction<{ ruleSet: IRuleSet }>): IState => {
  const defaultRuleSet = {
    x: 19,
    y: 19,
    komi: 5.5,
    handicap: 0,
  };

  Object.assign(defaultRuleSet, action.ruleSet);

  return {
    ...state,
    localGame: {
      ruleSet: defaultRuleSet,
      phase: EGamePhase.Running,
      moveNumber: 0,
      moveHistory: [],
      board: (new Array(defaultRuleSet.x * defaultRuleSet.y)).fill(EField.Empty),
      ko: false,
      toMove: EColor.Black,
      capturedByBlack: 0,
      capturedByWhite: 0,
    },
  };
};

const addLocalMove = (state: IState, action: TAction<{ move: TMove }>): IState => {
  if (!state.localGame) {
    return state;
  }

  if (!testMove(state.localGame, action.move)) {
    return state;
  }

  return {
    ...state,
    localGame: applyMove(state.localGame, action.move),
  };
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
    }
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
    }
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

function createReducer<S>(initialState: S, reducerObject: ReducersMapObject): Reducer<S> {
  return (state = initialState, action: Action) => {
    if (reducerObject.hasOwnProperty(action.type)) {
      return reducerObject[action.type](state, action);
    }
    return state;
  };
}

export default <S>(initialState: S) => createReducer(initialState, {
  'WINDOW_RESIZE': resize('window'),
  'APP_BAR_RESIZE': resize('appBar'),
  'SIDE_BAR_RESIZE': resize('sideBar'),

  'GAME_LOCAL_INIT': initLocalGame,
  'GAME_LOCAL_ADD_MOVE': addLocalMove,

  'CONNECTION_STATUS_CHANGE': changeConnectionStatus,
  'LOGIN_STATE_CHANGE': changeLoginState,

  'OWN_USER_ID_CHANGE': changeOwnUserId,

  'RESOURCE_UPDATE': updateResource,

  'SUBSCRIBE_REQUEST': subscribeRequest,
  'SUBSCRIBE_RESPONSE': subscribeResponse,
  'SUBSCRIBE_ERROR': subscribeError,

});
