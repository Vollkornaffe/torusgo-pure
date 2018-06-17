import {Action} from 'redux';

interface IMap<T> {
  [key: string]: T,
}

//
// game types
//

export interface IRegMove {
  type: 'M',
  x: number,
  y: number,
}

export interface IPass {
  type: 'P'
}

export type TMove = IRegMove | IPass;

export interface IPosition {
  x: number,
  y: number,
}
export enum EColor {Black=1, White=2}

export enum EField {Empty=0, Black=1, White=2}

export type TGameBoard = EField[];

export enum EGamePhase {Waiting = 0, Running = 1}

export interface IMeta {
  observers: string[],
  blackId: string,
  whiteId: string,
  id: string,
}

export interface IRuleSet {
  x: number,
  y: number,
  komi: number,
  handicap: number,
}

export interface IGame {
  meta?: IMeta,
  ruleSet: IRuleSet,
  phase: EGamePhase,
  toMove: EColor,
  moveNumber: number,
  moveHistory: TMove[],
  board: TGameBoard,
  ko: boolean,
  koPosition?: IPosition,
  capturedByBlack: number,
  capturedByWhite: number,
}

//
// user types
//

export interface IUser {
  id: string,
  name: string,
  rank?: string,
}

//
// state/action types
//

export interface IError {
  error: string,
  message?: string,
}

export interface IDimension {
  width: number,
  height: number,
}

export type TResizable = 'window' | 'appBar' | 'sideBar';

export interface IState {
  games: {
    byId: IMap<TSubscribe<IGame>>,
    allIds: TSubscribe<string[]>,
  },
  localGame?: IGame,
  users: {
    byId: IMap<TSubscribe<IUser>>,
    allIds: TSubscribe<string[]>,
  },
  ownUserId?: string,
  dimensions: {
    [key in TResizable]: IDimension;
  },
  loginState: ELoginState,
  connectionStatus: EConnectionStatus,
  activeGameId?: string,
}

export type TAction<T={}> = Action & T;

//
// network
//

export type TSubscribe<T> = undefined | 'waiting' | IError | T;

export enum ELoginState {
  Undefined = 'undefined',
  User = 'user',
  Guest = 'guest',
}

export enum EConnectionStatus {
  Disconnected = 'disconnected',
  Connected = 'connected',
  Broken = 'broken'
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