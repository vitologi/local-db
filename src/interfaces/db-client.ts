import {IDbClientOptions} from './db-client-options';
import {IDbOptions} from './db-options';
import {IDb} from './db';

export const kOptions = Symbol('options');

export interface IDbClient<TDb> {
  [kOptions]: IDbClientOptions;
  get options(): Readonly<IDbClientOptions>;
  db(dbName?: string, options?: Partial<IDbOptions>): IDb<TDb>;
}
