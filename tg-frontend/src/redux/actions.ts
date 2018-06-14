import {IRuleSet} from '../types';

export const initLocalGame = (ruleSet: IRuleSet) => ({
  type: 'GAME_LOCAL_INIT',
  ruleSet,
});

export const addLocalPass = () => ({
  type: 'GAME_LOCAL_ADD_MOVE',
  move: {
    type: 'P',
  },
});

export const addLocalMove = (x: number, y: number) => ({
  type: 'GAME_LOCAL_ADD_MOVE',
  move: {
    type: 'M',
    x,
    y,
  },
});

export const windowResize = (width: number, height: number) => ({
  type: 'WINDOW_RESIZE',
  width,
  height,
});

export const appBarResize = (width: number, height: number) => ({
  type: 'APP_BAR_RESIZE',
  width,
  height,
});

export const sideBarResize = (width: number, height: number) => ({
  type: 'SIDE_BAR_RESIZE',
  width,
  height,
});

