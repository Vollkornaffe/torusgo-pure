import createReducer from '../utils/create-reducer';
import update from 'immutability-helper';

const initState = {
  activeGameId: null,
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
};

const viewGame = (state, action) => {
  if (action.id === state.activeGameId) return state;
  return update(state, {activeGameId: {$set: action.id}});
};

const resize = (element) => (state, action) => {
  if (action.width !== state[element].width
    || action.height !== state[element].height) {
    return update(state, {
      [element]: {
        width: {
          $set: action.width,
        },
        height: {
          $set: action.height,
        },
      },
    });
  }

  return state;
};

const reducer = createReducer(initState, {
  'VIEW_GAME': viewGame,
  'WINDOW_RESIZE': resize('window'),
  'APP_BAR_RESIZE': resize('appBar'),
  'SIDE_BAR_RESIZE': resize('sideBar'),
});

export default reducer;
