import {IDbClientOptions} from '../interfaces/db-client-options';
import {parseClientOptions} from '../utils/parse-client-options';
import {IDbOptions} from '../interfaces/db-options';
import {Db} from './db';
import {IDbClient, kOptions} from '../interfaces/db-client';

export class IDBClient implements IDbClient<IDBDatabase>{
  private static instance: IDBClient;
  [kOptions]: IDbClientOptions;

  get options(): Readonly<IDbClientOptions> {
    return Object.freeze({...this[kOptions]});
  }

  private dbs = new Map<string, Db>();

  private constructor(options?: Partial<IDbClientOptions>) {
    this[kOptions] = parseClientOptions(options);
  }

  static getInstance(options?:  Partial<IDbClientOptions>): IDBClient {
    if (!IDBClient.instance) {
      IDBClient.instance = new IDBClient(options);
    }
    return IDBClient.instance;
  }

  static db(dbName?: string, options?: Partial<IDbOptions>, clientOptions?: Partial<IDbClientOptions>): Db {
    return IDBClient.getInstance(clientOptions).db(dbName, options);
  }

  db(dbName?: string, options?: Partial<IDbOptions>): Db {
    // Get default name from client options if not provided
    if (!dbName) {
      dbName = this.options.dbName;
    }

    if (!this.dbs.has(dbName)) {
      const finalOptions = Object.assign({}, this[kOptions], options);
      this.dbs.set(dbName, new Db(this, dbName, finalOptions));
    }

    // Return the database
    return this.dbs.get(dbName) as Db;
  }
}

