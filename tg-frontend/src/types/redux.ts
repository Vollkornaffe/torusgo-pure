import {Action} from 'redux';
import {ThunkDispatch} from 'redux-thunk';
import {IDimension, TResizable} from '../types';
import {IGame, TGameId} from './game';
import {EConnectionStatus, ELoginState} from './network';
import {EResourceType, IResourceWrapper, TWithType} from './resource';
import {IUser, TUserId} from './user';
import {IMap} from './utils';

export type TAction<T={}> = Action & T;

export interface IState {
  resources: {
    game: IMap<IResourceWrapper<IGame & { resourceType: EResourceType.Game }>>;
    user: IMap<IResourceWrapper<IUser & { resourceType: EResourceType.User }>>;
    gameList: IMap<IResourceWrapper<TGameId[] & { resourceType: EResourceType.GameList }>>;
    userList: IMap<IResourceWrapper<TUserId[] & { resourceType: EResourceType.UserList }>>;
  },
  localGame?: IGame,
  ownUserId?: TUserId,
  dimensions: {
    [key in TResizable]: IDimension;
  },
  loginState: ELoginState,
  connectionStatus: EConnectionStatus,
  activeGameId?: string,
}