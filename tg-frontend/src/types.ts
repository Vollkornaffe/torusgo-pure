import {Action} from 'redux';

interface IMap<T> {
  [key: string]: T,
}

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

export enum EGamePhase {
  Waiting=0,
  Running=1,
}

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

export enum ELoginState {
  Undefined='undefined',
  User='user',
  Guest='guest',
}

export enum EConnectionState {
  Disconnected='disconnected',
  Connected='connected',
  Waiting='waiting',
}

export interface IDimension {
  width: number,
  height: number,
}

export type TResizable = 'window' | 'appBar' | 'sideBar';

export interface IState {
  games: {
    local?: IGame,
    byId: IMap<IGame>,
    allIds: IGame[],
  },
  dimensions: {
    [key in TResizable]: IDimension;
  },
  loginState: ELoginState,
  connectionState: EConnectionState,
  activeGameId: string | null,
}

export type TReducer<T> = (state: IState, action: Action & T) => IState;

export interface IViewProps {
  x: number,
  y: number,
  width: number,
  height: number,
}