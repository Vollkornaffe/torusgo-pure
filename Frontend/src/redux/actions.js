const initLocalGame = (ruleset) => ({
  type: 'GAME_LOCAL_INIT',
  ruleset,
});

const addLocalPass = () => ({
  type: 'GAME_LOCAL_ADD_MOVE',
  move: {
    type: 'P',
  },
});

const addLocalMove = (x, y) => ({
  type: 'GAME_LOCAL_ADD_MOVE',
  move: {
    type: 'M',
    x,
    y,
  },
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
  windowResize,
  appBarResize,
  sideBarResize,
  addLocalMove,
  addLocalPass,
  initLocalGame,
};
