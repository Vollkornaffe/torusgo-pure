import {IGame} from './game';
import {IUser} from './user';

export interface IError {
  error: string,
  message: string,
}

export enum EResourceStatus {
  Loading,
  Loaded,
  Unavailable,
}

export enum EResourceType {
  Game = 'game',
  User = 'user',
  UserList = 'gameList',
  GameList = 'userList',
}

export interface IResourceWrapper<T> {
  status: EResourceStatus;
  resourceType: EResourceType;
  value?: T;
  error?: IError;
}

export interface IGameWrapper extends IResourceWrapper<IGame> {
  resourceType: EResourceType.Game;
}

export interface IUserWrapper extends IResourceWrapper<IUser> {
  resourceType: EResourceType.User;
}

export interface IGameListWrapper extends IResourceWrapper<string[]> {
  resourceType: EResourceType.GameList;
}

export interface IUserListWrapper extends IResourceWrapper<string[]> {
  resourceType: EResourceType.UserList;
}
