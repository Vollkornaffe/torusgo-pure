import {IRuleSet, TMove} from '../types/game';
import {EConnectionStatus, ELoginState} from '../types/network';
import {EResourceType}                  from '../types/resource';
import store                            from './store';

// noinspection JSUnusedGlobalSymbols
export const initLocalGame = (ruleSet: IRuleSet) => store.dispatch({
  type: 'GAME_LOCAL_INIT',
  ruleSet,
});

// noinspection JSUnusedGlobalSymbols
export const addLocalPass = () => store.dispatch({
  type: 'GAME_LOCAL_ADD_MOVE',
  move: {
    type: 'P',
  },
});

// noinspection JSUnusedGlobalSymbols
export const addLocalMove = (x: number, y: number) => store.dispatch({
  type: 'GAME_LOCAL_ADD_MOVE',
  move: {
    type: 'M',
    x,
    y,
  },
});

export const changeConnectionStatus = (status: EConnectionStatus) => store.dispatch({
  type: 'CONNECTION_STATUS_CHANGE',
  status,
});

export const changeLoginState = (status: ELoginState) => store.dispatch({
  type: 'LOGIN_STATE_CHANGE',
  status,
});

export const changeOwnUserId = (id?: any) => store.dispatch({
  type: 'OWN_USER_ID_CHANGE',
  id,
});

export const updateResource = (resourceType: EResourceType, id: string, resource: any) => store.dispatch({
  type: 'RESOURCE_UPDATE',
  resourceType,
  id,
  resource,
});

export const subscribeResponse = (resourceType: EResourceType, id: string, resource: any) => store.dispatch({
  type: 'SUBSCRIBE_RESPONSE',
  resourceType,
  id,
  resource,
});

export const subscribeRequest = (resourceType: EResourceType, id: string) => store.dispatch({
  type: 'SUBSCRIBE_REQUEST',
  resourceType,
  id,
});

export const subscribeError = (resourceType: EResourceType, id: string, err: any) => store.dispatch({
  type: 'SUBSCRIBE_ERROR',
  resourceType,
  id,
  err,
});

// TODO same as everywhere, no keys in store
export const keyPressUpdate = (keyCode: string, pressed: boolean) => store.dispatch({
  type: 'KEY_PRESS_UPDATE',
  keyCode,
  pressed,
});
