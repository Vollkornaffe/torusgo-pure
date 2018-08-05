export type TGameId = string;
export type TGameListId = string;

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
  id: TGameId,
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