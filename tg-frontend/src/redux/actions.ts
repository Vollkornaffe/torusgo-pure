import {IError} from '../types';
import {IRuleSet} from '../types/game';
import {EConnectionStatus, ELoginState} from '../types/network';
import {EResourceType, TResource} from '../types/resource';
import {TUserId} from '../types/user';

import store from './store';

export const initLocalGame = (ruleSet: IRuleSet) => store.dispatch({
  type: 'GAME_LOCAL_INIT',
  ruleSet,
});

export const addLocalPass = () => store.dispatch({
  type: 'GAME_LOCAL_ADD_MOVE',
  move: {
    type: 'P',
  },
});

export const addLocalMove = (x: number, y: number) => store.dispatch({
  type: 'GAME_LOCAL_ADD_MOVE',
  move: {
    type: 'M',
    x,
    y,
  },
});

export const resizeWindow = (width: number, height: number) => store.dispatch({
  type: 'WINDOW_RESIZE',
  width,
  height,
});

export const resizeAppBar = (width: number, height: number) => store.dispatch({
  type: 'APP_BAR_RESIZE',
  width,
  height,
});

export const resizeSidebar = (width: number, height: number) => store.dispatch({
  type: 'SIDE_BAR_RESIZE',
  width,
  height,
});

export const changeConnectionStatus = (status: EConnectionStatus) => store.dispatch({
  type: 'CONNECTION_STATUS_CHANGE',
  status,
});

export const changeLoginState = (status: ELoginState) => store.dispatch({
  type: 'LOGIN_STATE_CHANGE',
  status,
});

export const changeOwnUserId = (id?: TUserId) => store.dispatch({
  type: 'OWN_USER_ID_CHANGE',
  id,
});

export const updateResource = (resource: TResource, id: string) => store.dispatch({
  type: 'RESOURCE_UPDATE',
  resource,
  id,
});

export const subscribeResponse = (resource: TResource, id: string) => store.dispatch({
  type: 'SUBSCRIBE_RESPONSE',
  resource,
  id,
});

export const subscribeRequest = (resourceType: EResourceType, id: string) => store.dispatch({
  type: 'SUBSCRIBE_REQUEST',
  resourceType,
  id,
});

export const subscribeError = (resourceType: EResourceType, id: string, err: IError) => store.dispatch({
  type: 'SUBSCRIBE_ERROR',
  err,
  id,
});
