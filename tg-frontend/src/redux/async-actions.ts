import {
  ELoginState,
  ILoginCredentialsResponse,
  ILoginGuestResponse,
  ILoginTokenResponse,
  IRegisterResponse,
  IUpgradeResponse
} from '../types/network';
import {EResourceStatus, EResourceType} from '../types/resource';
import {sendWithAck} from '../utils/socket-io';
import tokenManager from '../utils/token';
import {
  changeLoginState,
  changeOwnUserId,
  subscribeError,
  subscribeRequest,
  subscribeResponse
} from './actions';

import store from './store';

export const asyncLoginWithToken = (token: string) => {
  if (store.getState().loginState !== ELoginState.Undefined) {
    return;
  }

  sendWithAck('login_token', token)
    .then((response: ILoginTokenResponse) => {
      if (response.token) {
        tokenManager.write(response.token);
      }
      changeLoginState(response.loginState);
      asyncChangeOwnUserId(response.id);
    })
    .catch((err: any) => {
      return console.log(err);
    });
};

export const asyncLoginWithCredentials = (username: string, password: string) => {
  if (store.getState().loginState !== ELoginState.Undefined) {
    return;
  }

  sendWithAck('login_credentials', {username, password})
    .then((response: ILoginCredentialsResponse) => {
      tokenManager.write(response.token);
      changeLoginState(ELoginState.User);
      asyncChangeOwnUserId(response.id);
    })
    .catch((err: any) => {
      console.log(err);
    });
};

export const asyncLoginAsGuest = () => {
  if (store.getState().loginState !== ELoginState.Undefined) {
    return;
  }
  sendWithAck('login_guest', null)
    .then((response: ILoginGuestResponse) => {
      tokenManager.write(response.token);
      changeLoginState(ELoginState.Guest);
      asyncChangeOwnUserId(response.id);
    })
    .catch((err: any) => {
      console.log(err);
    });
};

export const asyncChangeOwnUserId = (id?: string) => {
  changeOwnUserId(id);
  if (id) {
    asyncSubscribe(EResourceType.User, id);
  }
};

export const asyncRegister = (username: string, email: string, password: string) => {
  if (store.getState().loginState !== ELoginState.Undefined) {
    return;
  }
  sendWithAck('register', {username, email, password})
    .then((response: IRegisterResponse) => {
      tokenManager.write(response.token);
      changeLoginState(ELoginState.User);
      changeOwnUserId(response.id);
    })
    .catch((err: any) => {
      console.log(err);
    });
};

export const asyncUpgrade = (username: string, email: string, password: string) => {
  if (store.getState().loginState !== ELoginState.Guest) {
    return;
  }
  sendWithAck('upgrade', {username, email, password})
    .then((response: IUpgradeResponse) => {
      if (response.token) {
        tokenManager.write(response.token);
      }
      changeLoginState(ELoginState.User);
    })
    .catch((err: any) => {
      console.log(err);
    });
};

export const asyncLogout = () => {
  if (store.getState().loginState === ELoginState.Undefined) {
    return;
  }
  sendWithAck('logout', null)
    .then(() => {
      tokenManager.clear();
      changeLoginState(ELoginState.Undefined);
      changeOwnUserId();
    })
    .catch((err: any) => {
      console.log(err);
    });
};

export const asyncSubscribe = (resourceType: EResourceType, id: string) => {
  const resource = store.getState().resources[resourceType][id];

  if (resource && resource.status !== EResourceStatus.Unavailable) {
    // only subscribe if the resource is not already loading or loaded
    return;
  }

  subscribeRequest(resourceType, id);
  sendWithAck('subscribe', {type: resourceType, id})
    .then((data: any) => subscribeResponse(resourceType, id, data))
    .catch((err: any) => subscribeError(resourceType, id, err));
};
