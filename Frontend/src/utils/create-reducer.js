/**
 * Transforms a reducer Object into a reducer function
 * @param {object} initialState The initial redux state
 * @param {object} reducerObject An Object of the shape:
 *    {
 *      actionName: reducer,
 *      ...
 *    }
 * @return {Function} a reducer
 */
function createReducer(initialState, reducerObject) {
  return function (state = initialState, action) {
    if (reducerObject.hasOwnProperty(action.type)) {
      return reducerObject[action.type](state, action);
    }
    return state;
  };
}

export default createReducer;
