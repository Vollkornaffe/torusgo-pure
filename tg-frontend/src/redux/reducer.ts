import {Action, Reducer, ReducersMapObject} from 'redux';
import {
  EColor,
  EConnectionStatus,
  EField,
  EGamePhase,
  ELoginState,
  IDimension,
  IError,
  IGame,
  IRuleSet,
  IState,
  IUser,
  TAction,
  TMove,
  TResizable
} from '../types';
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

const changeLoginState = (state: IState, action: TAction<{ state: ELoginState }>): IState => {
  if (action.state === state.loginState) {
    return state;
  }
  return {
    ...state,
    loginState: action.state,
  }
};


const updateGame = (state: IState, action: TAction<{ id: string, game: IGame }>): IState => {
  if (!state.users.byId[action.id]) {
    return state;
  }
  return {
    ...state,
    games: {
      ...state.games,
      byId: {
        ...state.games.byId,
        [action.id]: action.game,
      },
    },
  }
};

const updateUser = (state: IState, action: TAction<{ id: string, user: IUser }>): IState => {
  if (!state.users.byId[action.id]) {
    return state;
  }
  return {
    ...state,
    users: {
      ...state.users,
      byId: {
        ...state.users.byId,
        [action.id]: action.user,
      },
    },
  }
};

const updateGameList = (state: IState, action: TAction<{ id: string, gameIds: string[] }>): IState => {
  return {
    ...state,
    games: {
      ...state.games,
      allIds: action.gameIds,
    },
  }
};

const updateUserList = (state: IState, action: TAction<{ id: string, userIds: string[] }>): IState => {
  return {
    ...state,
    users: {
      ...state.users,
      allIds: action.userIds,
    },
  }
};


const subscribeToGameRequest = (state: IState, action: TAction<{ id: string }>): IState => {
  return {
    ...state,
    games: {
      ...state.games,
      byId: {
        ...state.games.byId,
        [action.id]: 'waiting',
      },
    },
  };
};

const subscribeToGameResponse = (state: IState, action: TAction<{ id: string, data: IGame }>): IState => {
  return {
    ...state,
    games: {
      ...state.games,
      byId: {
        ...state.games.byId,
        [action.id]: action.data,
      },
    },
  };
};

const subscribeToGameError = (state: IState, action: TAction<{ id: string, err: IError }>): IState => {
  return {
    ...state,
    games: {
      ...state.games,
      byId: {
        ...state.games.byId,
        [action.id]: action.err,
      },
    },
  };
};


const subscribeToGameListRequest = (state: IState): IState => {
  return {
    ...state,
    games: {
      ...state.games,
      allIds: 'waiting',
    },
  };
};

const subscribeToGameListResponse = (state: IState, action: TAction<{ data: string[] }>): IState => {
  return {
    ...state,
    games: {
      ...state.games,
      allIds: action.data,
    },
  };
};

const subscribeToGameListError = (state: IState, action: TAction<{ err: IError }>): IState => {
  return {
    ...state,
    games: {
      ...state.games,
      allIds: action.err,
    },
  };
};


const subscribeToUserRequest = (state: IState, action: TAction<{ id: string }>): IState => {
  return {
    ...state,
    users: {
      ...state.users,
      byId: {
        ...state.users.byId,
        [action.id]: 'waiting',
      },
    },
  };
};

const subscribeToUserResponse = (state: IState, action: TAction<{ id: string, data: IUser }>): IState => {
  return {
    ...state,
    users: {
      ...state.users,
      byId: {
        ...state.users.byId,
        [action.id]: action.data,
      },
    },
  };
};

const subscribeToUserError = (state: IState, action: TAction<{ id: string, err: IError }>): IState => {
  return {
    ...state,
    users: {
      ...state.users,
      byId: {
        ...state.users.byId,
        [action.id]: action.err,
      },
    },
  };
};


const subscribeToUserListRequest = (state: IState): IState => {
  return {
    ...state,
    users: {
      ...state.users,
      allIds: 'waiting',
    },
  };
};

const subscribeToUserListResponse = (state: IState, action: TAction<{ data: string[] }>): IState => {
  return {
    ...state,
    users: {
      ...state.users,
      allIds: action.data,
    },
  };
};

const subscribeToUserListError = (state: IState, action: TAction<{ err: IError }>): IState => {
  return {
    ...state,
    users: {
      ...state.users,
      allIds: action.err,
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
  'LOGIN_STATUS_CHANGE': changeLoginState,

  'USER_UPDATE': updateUser,
  'GAME_UPDATE': updateGame,

  'USER_LIST_UPDATE': updateUserList,
  'GAME_LIST_UPDATE': updateGameList,

  'USER_SUBSCRIBE_REQUEST': subscribeToUserRequest,
  'USER_SUBSCRIBE_RESPONSE': subscribeToUserResponse,
  'USER_SUBSCRIBE_ERROR': subscribeToUserError,

  'GAME_SUBSCRIBE_REQUEST': subscribeToGameRequest,
  'GAME_SUBSCRIBE_RESPONSE': subscribeToGameResponse,
  'GAME_SUBSCRIBE_ERROR': subscribeToGameError,

  'USER_LIST_SUBSCRIBE_REQUEST': subscribeToUserListRequest,
  'USER_LIST_SUBSCRIBE_RESPONSE': subscribeToUserListResponse,
  'USER_LIST_SUBSCRIBE_ERROR': subscribeToUserListError,

  'GAME_LIST_SUBSCRIBE_REQUEST': subscribeToGameListRequest,
  'GAME_LIST_SUBSCRIBE_RESPONSE': subscribeToGameListResponse,
  'GAME_LIST_SUBSCRIBE_ERROR': subscribeToGameListError,
});