export type TUserId = string;
export type TUserListId = string;

export interface IUser {
  id: TUserId,
  name: string,
  rank?: string,
}