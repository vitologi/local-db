import { IDbProvider, IDbProviderMigration } from "../../interfaces";
import { extendTransactionCallback } from "./extend-transaction-callback";

export enum CommandStatus {
  Pending = 'Pending',
  Executing = 'Executing',
  Completed = 'Completed',
  Canceled = 'Canceled',
}

export class IdbMigrationCommand {
  private readonly db: IDbProvider;
  private readonly version: number;
  private readonly up: () => Promise<void>;
  // private readonly down: (db: IDb) => Promise<void>;
  private idb: IDBDatabase | null = null;
  private idbListeners = new Set<(value: IDBDatabase) => void>();
  // private status: CommandStatus = CommandStatus.Pending;
  private statusListeners = new Set<(value: CommandStatus) => void>();
  private transactionListeners = new Set<(value: IDBTransaction | null) => void>();

  constructor(config: IDbProviderMigration, version: number, db: IDbProvider) {
    this.db = db;
    this.version = version;
    this.up = config.up;
    // this.down = config.down;
  }

  async execute(/* type: 'up' | 'down' = 'up' */): Promise<void> {
    const targetVersion = this.version;
    const name = this.db.name;

    return new Promise<void>((resolve, reject) => {
      const openRequest = indexedDB.open(name, targetVersion);
      let isUpgradeMode = false;
      let isSuccessFired = false;
      const finalResolve = () => {
        this.setStatus(CommandStatus.Completed);
        resolve();
      }

      // old connection wasn't closed
      openRequest.onblocked = (event: Event) => {
        alert('There are old running application copies, please close them.');
        reject(event);
      };

      openRequest.onerror = (event: Event) => {
        reject(event);
      };

      openRequest.onsuccess = () => {
        const idb = openRequest.result;
        // update database in other tab handler (parallel update) or in multiple migrations
        idb.onversionchange = () => {
          idb.close();
          // if (confirm('Database has been upgraded. Do you want to reload page?')) {
          //   window.location.reload();
          // }
        };
        isSuccessFired = true;
        if (isUpgradeMode) {
          return;
        }

        this.setIdb(idb);
        finalResolve();
      };

      openRequest.onupgradeneeded = (event: IDBVersionChangeEvent) => {
        isUpgradeMode = true;
        const {result: idb, transaction} = event.target as IDBOpenDBRequest;
        this.setStatus(CommandStatus.Executing);
        this.setIdb(idb);
        this.setTransaction(transaction);


        if(transaction){
          const setNull = () => this.setTransaction(null);
          extendTransactionCallback(transaction, 'oncomplete', setNull);
          extendTransactionCallback(transaction, 'onerror', setNull);
          extendTransactionCallback(transaction, 'onabort', setNull);
        }

        this.up()
          .then(() => {
            // TODO: need to use logger
            // console.log(`Db:${name} Version:${targetVersion} Status: migration base completed`);
            if (isSuccessFired) {
              finalResolve();
            }
          })
          .catch((err) => {
            // TODO: need to use logger
            // console.error(`Db:${name} Version:${targetVersion} Status: migration base error`, err);
            if (transaction)
              transaction.abort();
            this.setStatus(CommandStatus.Canceled);
            this.setTransaction(null);
            reject(err);
          })
          .finally(() => (isUpgradeMode = false));

      };
    });
  }

  onStatusChanges(callback: (value: CommandStatus) => void): () => void {
    this.statusListeners.add(callback);
    return () => this.statusListeners.delete(callback);
  }

  onTransactionChanges(callback: (value: IDBTransaction | null) => void): () => void {
    this.transactionListeners.add(callback);
    return () => this.transactionListeners.delete(callback);
  }

  onDbSourceChanges(callback: (value: IDBDatabase) => void): () => void {
    this.idbListeners.add(callback);
    return () => this.idbListeners.delete(callback);
  }

  async getDbSource(): Promise<IDBDatabase> {
    if (this.idb) {
      return this.idb;
    }

    return new Promise((resolve) => {
      const listener = (value: IDBDatabase) => {
        resolve(value);
        this.idbListeners.delete(listener);
      };
      this.idbListeners.add(listener);
    })
  }


  private setIdb(value: IDBDatabase): void {
    this.idb = value;
    this.idbListeners.forEach((callback) => {
      callback(value);
    });
  }

  private setTransaction(value: IDBTransaction | null): void {
    // this.transaction = value;
    this.transactionListeners.forEach((callback) => {
      callback(value);
    });
  }

  private setStatus(value: CommandStatus): void {
    // this.status = value;
    this.statusListeners.forEach((callback) => {
      callback(value);
    });
  }
}
