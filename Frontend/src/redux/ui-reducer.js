import createReducer from '../utils/create-reducer';
import update from 'immutability-helper';

const initState = {
  loginState: 'undefined',
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

const resize = (element) => (state, action) => {
  if (
    action.width === state[element].width
    && action.height === state[element].height
  ) return state;

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
};

const reducer = createReducer(initState, {
  'WINDOW_RESIZE': resize('window'),
  'APP_BAR_RESIZE': resize('appBar'),
  'SIDE_BAR_RESIZE': resize('sideBar'),
});

export default reducer;
