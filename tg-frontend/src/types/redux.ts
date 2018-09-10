import {Action} from 'redux';
import {IGame} from './game';
import {EConnectionStatus, ELoginState} from './network';
import {
  IGameListWrapper,
  IGameWrapper,
  IUserListWrapper,
  IUserWrapper,
} from './resource';
import {IDimension, TResizable} from './ui';
import {IMap} from './utils';

export type TAction<T={}> = Action & T;

export interface IState {
  resources: {
    game: IMap<IGameWrapper>;
    user: IMap<IUserWrapper>;
    gameList: IMap<IGameListWrapper>;
    userList: IMap<IUserListWrapper>;
  },
  localGame?: IGame,
  ownUserId?: string,
  dimensions: {
    [key in TResizable]: IDimension;
  },
  loginState: ELoginState,
  connectionStatus: EConnectionStatus,
  activeGameId?: string,

  // control section
  pressedKeys: string[],
  controlKeys: {
    up:           string,
    down:         string,
    left:         string,
    right:        string,
    twistIn:      string,
    twistOut:     string,
    mouseControl: string,
  },
  cameraDelta: number,
}