import {Action, Dispatch} from 'redux';
import {ThunkDispatch} from 'redux-thunk';


//
// state/action types
//

export interface IError {
  error: string,
  message: string,
}

export interface IDimension {
  width: number,
  height: number,
}

export type TResizable = 'window' | 'appBar' | 'sideBar';

