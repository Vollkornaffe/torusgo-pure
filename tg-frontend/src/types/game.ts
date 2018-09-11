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

export enum EColor {
  Black = 'black',
  White = 'white',
}

export enum EField {
  Empty = 'empty',
  Black = 'black',
  White = 'white',
}

export type TGameBoard = EField[];

export enum EGamePhase {
  Waiting = 'waiting',
  Running = 'running',
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
