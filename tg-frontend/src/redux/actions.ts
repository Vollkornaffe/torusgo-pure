import {Dispatch} from 'redux';
import {
  EConnectionStatus,
  ELoginState,
  IError,
  IGame,
  ILoginCredentialsResponse,
  ILoginGuestResponse,
  ILoginTokenResponse,
  IRegisterResponse,
  IRuleSet,
  IState,
  IUpgradeResponse,
  IUser
} from '../types';
import {sendWithAck} from '../utils/socket-io';

import tokenManager from '../utils/token';

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

export const resizeWindow = (width: number, height: number) => ({
  type: 'WINDOW_RESIZE',
  width,
  height,
});

export const resizeAppBar = (width: number, height: number) => ({
  type: 'APP_BAR_RESIZE',
  width,
  height,
});

export const resizeSidebar = (width: number, height: number) => ({
  type: 'SIDE_BAR_RESIZE',
  width,
  height,
});

export const changeConnectionStatus = (status: EConnectionStatus) => ({
  type: 'CONNECTION_STATUS_CHANGE',
  status,
});

export const changeLoginState = (status: ELoginState) => ({
  type: 'LOGIN_STATUS_CHANGE',
  status,
});

export const changeOwnUserId = (id?: string) => ({
  type: 'OWN_USER_ID_CHANGE',
  id,
});

export const loginWithToken = (token: string) => (dispatch: Dispatch, getState: () => IState) => {
  if (getState().loginState !== ELoginState.Undefined) {
    return;
  }

  sendWithAck('login_token', token)
    .then((response: ILoginTokenResponse) => {
      if (response.token) {
        tokenManager.write(response.token);
      }
      dispatch(changeLoginState(response.loginState));
      dispatch(changeOwnUserId(response.id));
    })
    .catch((err: IError) => {
      console.log(err);
    });
};

export const loginWithCredentials = (username: string, password: string) => (dispatch: Dispatch, getState: () => IState) => {
  if (getState().loginState !== ELoginState.Undefined) {
    return;
  }

  sendWithAck('login_credentials', {username, password})
    .then((response: ILoginCredentialsResponse) => {
      tokenManager.write(response.token);
      dispatch(changeLoginState(ELoginState.User));
      dispatch(changeOwnUserId(response.id));
    })
    .catch((err: IError) => {
      console.log(err);
    });
};

export const loginAsGuest = () => (dispatch: Dispatch, getState: () => IState) => {
  if (getState().loginState !== ELoginState.Undefined) {
    return;
  }
  sendWithAck('login_guest', null)
    .then((response: ILoginGuestResponse) => {
      tokenManager.write(response.token);
      dispatch(changeLoginState(ELoginState.Guest));
      dispatch(changeOwnUserId(response.id));
    })
    .catch((err: IError) => {
      console.log(err);
    });
};

export const register = (username: string, email: string, password: string) => (dispatch: Dispatch, getState: () => IState) => {
  if (getState().loginState !== ELoginState.Undefined) {
    return;
  }
  sendWithAck('register', {username, email, password})
    .then((response: IRegisterResponse) => {
      tokenManager.write(response.token);
      dispatch(changeLoginState(ELoginState.User));
      dispatch(changeOwnUserId(response.id));
    })
    .catch((err: IError) => {
      console.log(err);
    });
};

export const upgrade = (username: string, email: string, password: string) => (dispatch: Dispatch, getState: () => IState) => {
  if (getState().loginState !== ELoginState.Guest) {
    return;
  }
  sendWithAck('upgrade', {username, email, password})
    .then((response: IUpgradeResponse) => {
      if (response.token) {
        tokenManager.write(response.token);
      }
      dispatch(changeLoginState(ELoginState.User));
    })
    .catch((err: IError) => {
      console.log(err);
    });
};

export const logout = () => (dispatch: Dispatch, getState: () => IState) => {
  if (getState().loginState === ELoginState.Undefined) {
    return;
  }
  sendWithAck('logout', null)
    .then(() => {
      tokenManager.clear();
      dispatch(changeLoginState(ELoginState.Undefined));
      dispatch(changeOwnUserId());
    })
    .catch((err: IError) => {
      console.log(err);
    });
};

const subscribeFactory = (type: string) => (id?: string) => (dispatch: Dispatch) => {
  const prefix = type.toUpperCase() + '_SUBSCRIBE_';

  dispatch({
    type: prefix + 'REQUEST',
    id,
  });

  return sendWithAck('subscribe', {type, id})
    .then((data: any) => dispatch({
      type: prefix + 'RESPONSE',
      id,
      data,
    }))
    .catch((err: any) => dispatch({
      type: prefix + 'ERROR',
      id,
      err: err as IError,
    }));
};

export const subscribeToGame = subscribeFactory('game');

export const subscribeToUser = subscribeFactory('user');

export const subscribeToGameList = subscribeFactory('game_list');

export const subscribeToUserList = subscribeFactory('user_list');

export const update = (type: string, data: any, id?: string) => {
  switch (type) {
    case 'game':
      return updateGame(id as string, data);
    case 'user':
      return updateUser(id as string, data);
    case 'game_list':
      return updateGameList(data);
    case 'user_list':
    default:
      return updateUserList(data);

  }
};

export const updateGame = (id: string, data: any) => ({
  type: 'GAME_UPDATE',
  id,
  game: data as IGame,
});

export const updateUser = (id: string, data: any) => ({
  type: 'USER_UPDATE',
  id,
  user: data as IUser,
});

export const updateGameList = (data: any) => ({
  type: 'GAME_LIST_UPDATE',
  gameIds: data as string[],
});

export const updateUserList = (data: any) => ({
  type: 'USER_LIST_UPDATE',
  userIds: data as string[],
});

