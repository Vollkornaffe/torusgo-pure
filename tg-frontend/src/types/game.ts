export interface IRegMove {
  type: 'M',
  x: number,
  y: number,
}

export interface IPass {
  type: 'P'
}

export type TMove = IRegMove | IPass;

export enum EMoveRequestState { NoMove = 'NoMove', Unprocessed = 'Unprocessed', LocalLegal = 'LocalLegal', SentToServer = 'SentToServer', }

export interface IPosition {
  x: number,
  y: number,
}

export interface ISize {
  x: number,
  y: number,
}

export enum EColor {Black = 'black', White = 'white'}

export type TField = EColor | null;

export type TGameBoard = TField[];

export enum EGamePhase {Waiting = 'waiting', Running = 'running'}

export interface IMeta {
  observers: string[],
  blackId: string,
  whiteId: string,
  id: string,
}

export interface IRuleSet {
  size: ISize,
  komi: number,
  handicap: number,
}

export interface IRawGame {
  ruleSet: IRuleSet,
  toMove: EColor,
  board: TGameBoard,
  ko: boolean,
  koPosition: IPosition,
  capturedByBlack: number,
  capturedByWhite: number,
}

export interface IGame {
  meta?: IMeta,
  phase: EGamePhase,
  moveNumber: number,
  moveHistory: TMove[],
  rawGame: IRawGame,
}
