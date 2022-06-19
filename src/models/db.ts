import {IDbOptions} from '../interfaces/db-options';
import {IDBClient} from './idb-client';
import {parseDbOptions} from '../utils/parse-db-options';
import {Collection} from './collection';
import {ICollectionOptions} from '../interfaces/collection-options';
import {IDb, IDbAddOptions, IDbFilterOptions, kOptions} from '../interfaces/db';
import {ICollection} from '../interfaces/collection';
import {DbStatus} from '../enums/db-status';
import {CommandStatus, MigrationCommand} from "./commands/migration-command";


interface IDbPrivate {
  status: DbStatus;
  options: IDbOptions;
  client: IDBClient;
  idb: IDBDatabase | null;  // indexedDb instance
  transaction: IDBTransaction | null;
}

export class Db implements IDb<IDBDatabase> {
  [kOptions]: IDbOptions;

  get options(): Readonly<IDbOptions> {
    return Object.freeze({...this[kOptions]});
  }

  get status(): DbStatus {
    return this.s.status;
  }

  get name(): string {
    return this.s.options.dbName;
  }

  get client(): IDBClient {
    return this.s.client;
  }

  private s: IDbPrivate;
  private idbListeners = new Set<(db: IDBDatabase) => void>();

  // private collections = new Map<string, Collection>();

  constructor(client: IDBClient, dbName?: string, options?: Partial<IDbOptions>) {
    this[kOptions] = parseDbOptions({
      ...options,
      dbName,
    });

    // eslint-disable-next-line @typescript-eslint/no-this-alias
    const db = this;

    this.s = {
      client,
      idb: null,
      transaction: null,
      status: DbStatus.Closed,
      get options(): IDbOptions {
        return db.options;
      },
    };

    this.open().then(() => {
      console.log(`The ${this.name} database was successfully opened`);
    });
  }

  collection<T>(name: string, options?: Partial<ICollectionOptions>): ICollection<T> {
    return new Collection<T>(this, name, options);
  }

  hasCollection(name: string): Promise<boolean> {
    return this.getDbSource().then((idb) => idb.objectStoreNames.contains(name));
  }

  createCollection(name: string, options?: IDBObjectStoreParameters, callback?: (error?: Error) => void): Promise<void> {
    if (this.status !== DbStatus.Upgraded) {
      throw new Error('Create operation available only during upgrade.');
    }

    const idb = this.s.idb;
    if (idb === null) {
      throw new Error('Db instance is not available.');
    }

    return new Promise<void>((resolve, reject) => {
      try {
        idb.createObjectStore(name, options);
        if (callback)
          callback();
        resolve();
      } catch (e) {
        if (callback)
          callback(e as Error);
        reject(e);
      }
    })
  }

  dropCollection(name: string, callback?: (error?: Error) => void): Promise<void> {
    if (this.status !== DbStatus.Upgraded) {
      throw new Error('Drop operation available only during upgrade.');
    }

    const idb = this.s.idb;
    if (idb === null) {
      throw new Error('Db instance is not available.');
    }

    return new Promise<void>((resolve, reject) => {
      try {
        idb.deleteObjectStore(name);
        if (callback)
          callback();
        resolve();
      } catch (e) {
        if (callback)
          callback(e as Error);
        reject(e);
      }
    })
  }

  async open(): Promise<this> {
    if (this.status === DbStatus.Opened) {
      return this;
    }
    console.log('open start');

    const migrations = this.options.migrations;
    const targetVersion = migrations.length;
    const currentVersion = await this.getCurrentIDBVersion();
    console.log('detected versions', currentVersion, targetVersion);

    let idb: IDBDatabase;
    for (let i = (currentVersion || 1); i <= targetVersion; i++) {
      try {
        idb = await this.migrateTo(i);
        if (i !== targetVersion) {
          continue;
        }
        await this.notifyIdbListeners(idb);
        this.setStatus(DbStatus.Opened);
      } catch (err) {
        this.setStatus(DbStatus.Closed);
      }
    }

    console.log('open return');
    return this;
  }

  async getDbSource(): Promise<IDBDatabase> {
    if (this.s.idb) {
      return this.s.idb;
    }

    return new Promise(((resolve) => {
      this.idbListeners.add(resolve);
    }));
  }

  private async getIdbStore(collectionName: string, readWrite = false): Promise<IDBObjectStore> {

    // TODO: detect and split different types of transactions (readonly - create new, upgrade - use it, readwrite - ??? maybe wait resolve)
    // if transaction is already exists use it (upgrade mode)
    if (this.s.transaction) {
      return this.s.transaction.objectStore(collectionName);
    }

    return this.getDbSource().then(idb => {
        return idb.transaction([collectionName], readWrite ? 'readwrite' : 'readonly').objectStore(collectionName);
      }
    );
  }

  private async notifyIdbListeners(db: IDBDatabase): Promise<void> {
    console.log('notifyIdbListeners start');
    this.idbListeners.forEach((listener) => listener(db));
    this.idbListeners.clear();
    console.log('notifyIdbListeners end');
  }


  async filter<T, R>(
    cb: (arg: Array<T>) => Array<R>,
    options: IDbFilterOptions,
  ): Promise<Array<R>> {
    const {collection, throttle = 0} = options;
    const store = await this.getIdbStore(collection.name);

    return new Promise((resolve, reject) => {
      if (throttle < 1) {
        const request = store.getAll();
        request.onerror = reject;
        request.onsuccess = function () {
          resolve(cb(this.result));
        };
        return;
      }

      const stack: Array<T> = [];
      const result: Array<R> = [];
      const request = store.openCursor();
      request.onerror = reject;
      request.onsuccess = function () {
        const cursor = this.result;

        if (
          !cursor
          || !(stack.length % throttle)
        ) {
          result.push(...cb(stack));
          stack.length = 0;
        }

        if (cursor) {
          stack.push(cursor.value);
          cursor.continue();
        } else {
          resolve(result);
        }
      };
    });
  }

  async add<T, F = string>(
    doc: T,
    options: IDbAddOptions<F>,
  ): Promise<F> {
    const {cb, collection} = options;
    const store = await this.getIdbStore(collection.name, true);

    return new Promise((resolve, reject) => {
      const request = store.add(doc);
      request.onerror = reject;
      request.onsuccess = function () {
        const result = this.result as unknown as F;
        if (cb) {
          cb(result);
        }

        resolve(result);
      };
    });
  }

  private async migrateTo(targetVersion: number): Promise<IDBDatabase> {
    const migration = this.options.migrations[targetVersion - 1];
    const migrationCommand = new MigrationCommand(migration, targetVersion, this);

    // TODO: (find out needs) for intermediate operations (like insert commands)
    const unsubscribeIdb = migrationCommand.onDbSourceChanges((value) => {
      this.s.idb = value;
    });
    const unsubscribeTransaction = migrationCommand.onTransactionChanges((value) => {
      this.s.transaction = value;
    });
    const unsubscribeStatus = migrationCommand.onStatusChanges((value) => {
      switch (value) {
        case CommandStatus.Executing:
          this.setStatus(DbStatus.Upgraded);
          break;

        default:
          this.setStatus(DbStatus.Closed);
      }
    })

    await migrationCommand.execute();
    unsubscribeIdb();
    unsubscribeStatus();
    unsubscribeTransaction();
    return migrationCommand.getDbSource();
  }

  private setStatus(status: DbStatus): void {
    this.s.status = status;
  }

  private getCurrentIDBVersion(): Promise<number> {
    return indexedDB.databases().then((dbs) => {
      const db = dbs.find((item) => this.name === item.name);
      return db && db.version ? db.version : 0;
    });
  }
}
