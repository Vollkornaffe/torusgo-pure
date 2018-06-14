import {Action, Reducer, ReducersMapObject} from 'redux';
import {
  EColor,
  EField, EGamePhase,
  IDimension,
  IRuleSet,
  TMove,
  TReducer,
  TResizable
} from '../types';
import {applyMove, testMove} from '../utils/game-logic';

const addLocalMove: TReducer<{ move: TMove }> = (state, action) => {
  if (!state.games.local) { return state; }

  const {move} = action;
  const game = state.games.local;

  if (!testMove(game, move)) { return state; }

  return {
    ...state,
    games: {
      ...state.games,
      local: applyMove(game, move),
    },
  }
};

const initLocalGame: TReducer<{ ruleSet: IRuleSet }> = (state, action) => {
  const defaultRuleSet = {
    x: 19,
    y: 19,
    komi: 5.5,
    handicap: 0,
  };

  Object.assign(defaultRuleSet, action.ruleSet);

  return {
    ...state,
    games: {
      ...state.games,
      local: {
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
    },
  };
};

function resize(element: TResizable): TReducer<IDimension> {
  return (state, action) => {
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
}

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
});