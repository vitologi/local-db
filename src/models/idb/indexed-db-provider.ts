import {
    ICreateCollectionOptions, IDbIteratorOptions,
    IDbProvider,
    IDbProviderMigration, IDeleteOptions, IDeleteResult,
    IDropCollectionOptions, IFindCallback,
    IFindOptions,
    IInitOptions,
    IInsertOptions, IInsertResult, IUpdateOptions, IUpdateResult,
} from "../../interfaces";
import { DbStatus } from "../../enums";
import { CommandStatus, IdbMigrationCommand } from "./idb-migration-command";
import { TransactionType } from "../../enums/transaction-type";
import { Callback } from "../../types/callback";
import { InferIdType } from "../../types/mongo-types";
import { IdbAsyncIterator } from "./idb-async-iterator";

export class IndexedDbProvider implements IDbProvider<IDBDatabase, IDBTransaction> {
    readonly name: string;
    private _status = DbStatus.Closed;
    private _migrations: IDbProviderMigration[];
    private _idb: IDBDatabase | null = null;
    private _transaction: IDBTransaction | null = null;
    private _idbListeners = new Set<(db: IDBDatabase) => void>();
    private _openListeners = new Set<(provider: this) => void>();
    private _statusListeners = new Set<(value: DbStatus) => void>();

    get status(): DbStatus {
        return this._status;
    }

    get transaction(): IDBTransaction | null {
        return this._transaction;
    }

    constructor(options: IInitOptions) {
        this.name = options.name;
        this._migrations = options.migrations;
    }

    getDBVersion(name: string): Promise<number> {
        return indexedDB.databases().then((dbs) => {
            const db = dbs.find((item) => name === item.name);
            return db && db.version ? db.version : 0;
        });
    }

    hasCollection(name: string): Promise<boolean> {
        return this.source().then((idb) => idb.objectStoreNames.contains(name));
    }

    createCollection(name: string, options?: ICreateCollectionOptions, callback?: (error?: Error) => void): Promise<void> {
        if (this.status !== DbStatus.Upgraded) {
            throw new Error('Create operation available only during upgrade.');
        }

        const idb = this._idb;
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
        });
    }

    // TODO: implement dependency guard option
    dropCollection(name: string, _?: IDropCollectionOptions, callback?: (error?: Error) => void): Promise<void> {
        if (this.status !== DbStatus.Upgraded) {
            throw new Error('Drop operation available only during upgrade.');
        }

        const idb = this._idb;
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

        if (this.status === DbStatus.Openening) {
            return new Promise(((resolve) => {
                this._openListeners.add(resolve);
            }));
        }
        this.setStatus(DbStatus.Openening);

        // console.log('open start');

        const migrations = this._migrations;
        const targetVersion = migrations.length;
        const currentVersion = await this.getDBVersion(this.name);
        // console.log('detected versions', currentVersion, targetVersion);

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

        // console.log('open return');
        await this.notifyOpenListeners(this);
        return this;
    }

    async find<TInitialDoc, TResultDoc, IOptions extends IFindOptions>(cb: IFindCallback<TInitialDoc, TResultDoc>, options?: IOptions): Promise<TResultDoc[]> {
        const {collection, indexes, throttle} = Object.assign({
            collection: this.name,
            indexes: [],
            throttle: false,
        }, options || {});
        const store = await this.getIdbStore(collection, TransactionType.Read);

        return new Promise((resolve, reject) => {
            if (!throttle) {
                const request = indexes.length ? store.index(indexes[0]).getAll() : store.getAll();
                request.onerror = reject;
                request.onsuccess = function () {
                    const values = this.result;
                    const result: TResultDoc[] = [];

                    for (let i = 0; i < values.length; i++) {
                        const value = values[i];
                        const data = cb(value);
                        if (data.done) {
                            return resolve(result);
                        }

                        result.push(data.value);
                    }

                    resolve(result);
                };
                return;
            }

            const result: TResultDoc[] = [];
            const request = indexes.length ? store.index(indexes[0]).openCursor() : store.openCursor();
            request.onerror = reject;
            request.onsuccess = function () {
                const cursor = this.result;
                if (!cursor) {
                    return resolve(result);
                }

                const data = cb(cursor.value);
                if (data.done) {
                    return resolve(result);
                }

                result.push(data.value);
                cursor.continue();
            };
        });
    }

    // TODO: fix situation when operation have been executed partially
    async insert<TSchema>(values: TSchema[], options?: IInsertOptions, callback?: Callback<IInsertResult<TSchema>>): Promise<IInsertResult<TSchema>> {
        const {collection} = Object.assign({collection: this.name}, options || {});
        const store = await this.getIdbStore(collection, TransactionType.ReadWrite);
        const transaction = store.transaction;
        const operations: Promise<InferIdType<TSchema>>[] = [];

        for (let i = 0; i < values.length; i++) {
            operations.push(new Promise(((resolve, reject) => {
                const request = store.add(values[i]);
                request.onerror = reject;
                request.onsuccess = function () {
                    resolve(this.result as InferIdType<TSchema>);
                };
            })))
        }

        return new Promise(async (resolve, reject) => {
            let result: IInsertResult<TSchema>;

            try {
                result = {
                    insertedCount: operations.length,
                    insertedIds: {...await Promise.all(operations) as InferIdType<TSchema>[]},
                };
            } catch (err) {
                result = {insertedCount: 0, insertedIds: {}};

                if (callback)
                    callback(err as Error, result);

                reject(err);
            }

            transaction.onerror = transaction.onabort = () => {
                if (callback)
                    callback(new Error('Insert transaction emits an error'), result);
                reject(result);
            }
            transaction.oncomplete = () => {
                if (callback)
                    callback(undefined, result);
                resolve(result);
            }
        });
    }

    // TODO: fix situation when operation have been executed partially
    async update<TSchema>(values: TSchema[], options?: IUpdateOptions, callback?: Callback<IUpdateResult<TSchema>>): Promise<IUpdateResult<TSchema>> {
        const {collection} = Object.assign({collection: this.name}, options || {});
        const store = await this.getIdbStore(collection, TransactionType.ReadWrite);
        const transaction = store.transaction;
        const operations: Promise<InferIdType<TSchema>>[] = [];

        for (let i = 0; i < values.length; i++) {
            operations.push(new Promise(((resolve, reject) => {
                const request = store.put(values[i]);
                request.onerror = reject;
                request.onsuccess = function () {
                    resolve(this.result as InferIdType<TSchema>);
                };
            })))
        }

        return new Promise(async (resolve, reject) => {
            let result: IUpdateResult<TSchema>;
            try {
                result = {
                    matchedCount: operations.length,
                    upsertedCount: operations.length,
                    upsertedIds: {...await Promise.all(operations)}
                };
            } catch (err) {
                result = {matchedCount: 0, upsertedCount: 0, upsertedIds: {}};

                if (callback)
                    callback(err as Error, result);

                reject(err);
            }

            transaction.onerror = transaction.onabort = () => {
                if (callback)
                    callback(new Error('Update transaction emits an error'), result);
                reject(result);
            }
            transaction.oncomplete = () => {
                if (callback)
                    callback(undefined, result);
                resolve(result);
            }
        });
    }

    // TODO: fix situation when operation have been executed partially
    async delete<TId>(values: TId[], options?: IDeleteOptions, callback?: Callback<IDeleteResult>): Promise<IDeleteResult> {
        const {collection} = Object.assign({collection: this.name}, options || {});
        const store = await this.getIdbStore(collection, TransactionType.ReadWrite);
        const transaction = store.transaction;
        const operations: Promise<TId>[] = [];

        for (let i = 0; i < values.length; i++) {
            operations.push(new Promise(((resolve, reject) => {
                const request = store.delete(values[i] as unknown as IDBValidKey);
                request.onerror = reject;
                request.onsuccess = function () {
                    resolve(values[i]);
                };
            })))
        }

        return new Promise(async (resolve, reject) => {
            let result: IDeleteResult;

            try {
                result = {deletedCount: (await Promise.all(operations)).length};
            } catch (err) {
                result = {deletedCount: 0};

                if (callback)
                    callback(err as Error, result);

                reject(err);
            }

            transaction.onerror = transaction.onabort = () => {
                if (callback)
                    callback(new Error('Delete transaction emits an error'), result);
                reject(result);
            }
            transaction.oncomplete = () => {
                if (callback)
                    callback(undefined, result);
                resolve(result);
            }
        });
    }

    async source(): Promise<IDBDatabase> {
        if (this._idb) {
            return this._idb;
        }

        return new Promise(((resolve) => {
            this._idbListeners.add(resolve);
        }));
    }

    onStatusChanges(callback: (value: DbStatus) => void): () => void {
        this._statusListeners.add(callback);
        return () => this._statusListeners.delete(callback);
    }


    // TODO: implement native realization
    getAsyncIterator<TSchema>(options?: IDbIteratorOptions): AsyncIterable<TSchema> {
        const {collection, indexes} = Object.assign({collection: this.name, indexes: []}, options);
        const store = this.getIdbStore(collection);
        return new IdbAsyncIterator<TSchema>(store, indexes);
    }

    // TODO: implement configuration with indexes
    async getIterator<TSchema>(options?: IDbIteratorOptions): Promise<Iterable<TSchema>> {
        const {collection, indexes} = Object.assign({collection: this.name, indexes: []}, options);

        const store = await this.getIdbStore(collection);
        let request: IDBRequest<TSchema[]>;
        if (indexes.length) {
            const index = store.index(indexes[0]);
            request = index.getAll();
        } else {
            request = store.getAll();
        }

        return new Promise(((resolve, reject) => {
            request.onsuccess = function (_: Event) {
                resolve(this.result);
            }
            request.onerror = function (_: Event) {
                reject('Get db iterator error');
            }
        }));
    }

    private setStatus(value: DbStatus): void {
        this._status = value;
        this._statusListeners.forEach((callback) => {
            callback(value);
        });
    }

    private async notifyIdbListeners(db: IDBDatabase): Promise<void> {
        this._idbListeners.forEach((listener) => listener(db));
        this._idbListeners.clear();
    }

    private async notifyOpenListeners(db: this): Promise<void> {
        this._openListeners.forEach((listener) => listener(db));
        this._openListeners.clear();
    }

    private async migrateTo(targetVersion: number): Promise<IDBDatabase> {
        const migration = this._migrations[targetVersion - 1];
        const migrationCommand = new IdbMigrationCommand(migration, targetVersion, this);

        // TODO: (find out needs) for intermediate operations (like insert commands)
        const unsubscribeIdb = migrationCommand.onDbSourceChanges((value) => {
            this._idb = value;
        });
        const unsubscribeTransaction = migrationCommand.onTransactionChanges((value) => {
            this._transaction = value;
        });
        const unsubscribeStatus = migrationCommand.onStatusChanges((value) => {
            switch (value) {
                case CommandStatus.Executing:
                    this.setStatus(DbStatus.Upgraded);
                    break;

                case CommandStatus.Pending:
                case CommandStatus.Completed:
                    break;

                case CommandStatus.Canceled:
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

    private async getIdbStore(collectionName: string, transactionType = TransactionType.Read): Promise<IDBObjectStore> {

        // TODO: detect and split different types of transactions (readonly - create new, upgrade - use it, readwrite - ??? maybe wait resolve)
        // if transaction is already exists use it (upgrade mode)
        if (this.transaction) {
            return this.transaction.objectStore(collectionName);
        }

        return this.source().then(idb => {
                return idb.transaction([collectionName], ({
                    [TransactionType.Read]: "readonly",
                    [TransactionType.Write]: "readwrite",
                    [TransactionType.ReadWrite]: "readwrite",
                    [TransactionType.Update]: "versionchange",
                })[transactionType] as IDBTransactionMode).objectStore(collectionName);
            }
        );
    }
}
