import update from 'immutability-helper/index';
import createReducer from '../utils/create-reducer';

const initState = {
  byId: {},
  allIds: [],
};

const addUser = (state, action) => {
  const {id, name, rank} = action;

  if (!state.byId.hasOwnProperty(id)) {
    return update(state, {
      byId: {
        [id]: {$set: {id, name, rank}},
      },
      allIds: {
        $push: [id],
      },
    });
  }
  return state;
};

const reducer = createReducer(initState, {
  'USER_ADD': addUser,
});

export default reducer;
