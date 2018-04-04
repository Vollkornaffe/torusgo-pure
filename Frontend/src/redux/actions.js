const addDefaultGame = () => ({
  type: 'GAME_ADD_DEFAULT',
});

const addUser = (id, name, rank = '20 kyu') => ({
  type: 'USER_ADD',
  id,
  name,
  rank,
});


const addGame = (id, blackId, whiteId, rules) => ({
  type: 'GAME_ADD',
  id,
  rules,
  whiteId,
  blackId,
});

const addPass = (id) => ({
  type: 'GAME_ADD_MOVE',
  id,
  move: {
    type: 'P',
  },
});

const addRegularMove = (id, x, y) => ({
  type: 'GAME_ADD_MOVE',
  id,
  move: {
    type: 'M',
    x,
    y,
  },
});

// TODO add scoring move

const viewGame = (id) => ({
  type: 'VIEW_GAME',
  id,
});

const windowResize = (width, height) => ({
  type: 'WINDOW_RESIZE',
  width,
  height,
});

const appBarResize = (width, height) => ({
  type: 'APP_BAR_RESIZE',
  width,
  height,
});

const sideBarResize = (width, height) => ({
  type: 'SIDE_BAR_RESIZE',
  width,
  height,
});

export {
  addUser,
  addPass,
  addRegularMove,
  addDefaultGame,
  addGame,
  viewGame,
  windowResize,
  appBarResize,
  sideBarResize,
};
