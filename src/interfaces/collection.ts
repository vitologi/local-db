import {ICollectionOptions} from './collection-options';
import {IDb} from './db';
import {Filter} from '../types/mongo-types';
import {IInsertOneCommandOptions} from '../models/commands/insert-one-command';
import {IFindCommandOptions} from '../models/commands/find-command';

export const kOptions = Symbol('options');

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export interface ICollection<T, TDb = any> {
  [kOptions]: ICollectionOptions;

  options: Readonly<ICollectionOptions>;

  db: IDb<TDb>;

  name: string;

  find(filter: Filter<T>, options?: IFindCommandOptions): Promise<T[]>;
  insertOne(data: T, options?: IInsertOneCommandOptions): Promise<T>

  findById(id: string): Promise<T>;
}

