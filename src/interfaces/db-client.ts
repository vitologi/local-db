import {IDbClientOptions} from './options/db-client-options';
import {IDbOptions} from './options/db-options';
import {IDb} from './db';

export const kOptions = Symbol('options');

export interface IDbClient {
  [kOptions]: IDbClientOptions;
  get options(): Readonly<IDbClientOptions>;
  db(dbName?: string, options?: IDbOptions): IDb;
}
