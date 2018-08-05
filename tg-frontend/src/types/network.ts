export enum ELoginState {
  Undefined = 'undefined',
  User = 'user',
  Guest = 'guest',
}

export enum EConnectionStatus {
  Connected = 'connected',
  Connecting = 'reconnecting',
  Disconnected = 'disconnected',
}

export interface ILoginCredentialsResponse {
  token: string,
  id: string,
}

export interface ILoginTokenResponse {
  token?: string,
  id: string,
  loginState: ELoginState,
}

export interface ILoginGuestResponse {
  token: string,
  id: string,
}

export interface IRegisterResponse {
  token: string,
  id: string,
}

export interface IUpgradeResponse {
  token?: string,
}