import { IDb, IDbClientOptions } from '../interfaces';
import {parseClientOptions} from '../utils/parse-client-options';
import {IDbOptions} from '../interfaces';
import {Db} from './db';
import {IDbClient, kOptions} from '../interfaces/db-client';

export class DbClient implements IDbClient{
  [kOptions]: IDbClientOptions;

  get options(): Readonly<IDbClientOptions> {
    return Object.freeze({...this[kOptions]});
  }

  private dbs = new Map<string, Db>();

  constructor(options?: Partial<IDbClientOptions>) {
    this[kOptions] = parseClientOptions(options);
  }

  db(dbName?: string, options?: Partial<IDbOptions>): IDb {
    // Get default name from client options if not provided
    if (!dbName) {
      dbName = this.options.dbName;
    }

    if (!this.dbs.has(dbName)) {
      const finalOptions = Object.assign({
        client: this,
        name: dbName,
        provider: this.options.provider,
      }, options);
      this.dbs.set(dbName, new Db(dbName, finalOptions));
    }

    // Return the database
    return this.dbs.get(dbName) as IDb;
  }
}

