import {IError} from '../types';
import {IGame, TGameId} from './game';
import {IUser, TUserId} from './user';

export enum EResourceStatus {
  Loading,
  Loaded,
  Unavailable,
}

export enum EResourceType {
  Game,
  User,
  UserList,
  GameList,
}

export type TWithType<T> = T & { resourceType: EResourceType };

export type TResource = (IGame & { resourceType: EResourceType.Game })
  | (IUser & { resourceType: EResourceType.User })
  | (TUserId[] & { resourceType: EResourceType.UserList })
  | (TGameId[] & { resourceType: EResourceType.GameList });

export interface IResourceWrapper<T extends TResource> {
  status: EResourceStatus,
  value?: T;
  error?: IError,
}

export interface ILoadedResource<T extends TResource> extends IResourceWrapper<T>{
  status: EResourceStatus.Loaded;
  value: T;
}

export interface ILoadingResource<T extends TResource> extends IResourceWrapper<T>{
  status: EResourceStatus.Loading;
}

export interface IUnavailableResource<T extends TResource> extends IResourceWrapper<T> {
  status: EResourceStatus.Unavailable;
  error: IError,
}
export interface IGameResource {
  type: EResourceType.Game;
  value: IGame;
}

interface IRes {
  status: EResourceStatus,
  type: EResourceType,
}


export const isLoaded = <T extends TResource>(resource?: IResourceWrapper<T>): resource is ILoadedResource<T> => {
  return resource ? resource.status === EResourceStatus.Loaded : false;
};

export const isLoading = <T extends TResource>(resource?: IResourceWrapper<T>): resource is ILoadingResource<T> => {
  return resource ? resource.status === EResourceStatus.Loading : false;
};

export const isUnavailable = <T extends TResource>(resource?: IResourceWrapper<T>): resource is IUnavailableResource<T> => {
  return resource ? resource.status === EResourceStatus.Unavailable : false;
};
