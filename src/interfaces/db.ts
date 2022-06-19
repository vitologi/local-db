import {IDbOptions} from './db-options';
import {IDBClient} from '../models/idb-client';
import {ICollectionOptions} from './collection-options';
import {ICollection} from './collection';
import {DbStatus} from "../enums/db-status";

export const kOptions = Symbol('options');

export interface IDbFilterOptions {
  collection: ICollection<any>;
  throttle?: number;
}

export interface IDbAddOptions<TId> {
  collection: ICollection<any>;
  cb?: (id: TId) => void;
}

export interface IDb<TDb = any> {
  [kOptions]: IDbOptions;

  options: Readonly<IDbOptions>;
  name: string;
  client: IDBClient;
  status: DbStatus;

  open(): Promise<this>;

  getDbSource(): Promise<TDb>;

  collection<T>(name: string, options?: Partial<ICollectionOptions>): ICollection<T>;

  hasCollection(name: string): Promise<boolean>;

  createCollection(name: string, options?: IDBObjectStoreParameters, callback?: (error?: Error) => void): Promise<void>; // TODO: create own options (use generic)
  dropCollection(name: string, callback?: (error?: Error) => void): Promise<void>;

  filter<TResultDoc, TInitialDoc>(cb: (arg: Array<TInitialDoc>) => Array<TResultDoc>, options: IDbFilterOptions): Promise<Array<TResultDoc>>;

  add<TDoc, TId = string>(doc: TDoc, options: IDbAddOptions<TId>): Promise<TId>;
}
