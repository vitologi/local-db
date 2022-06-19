import {ICollection, kOptions} from '../interfaces/collection';
import {Db} from './db';
import {ICollectionOptions} from '../interfaces/collection-options';
import {parseCollectionOptions} from '../utils/parse-collection-options';
import {executeCommand} from '../utils/execute-command';
import {FindCommand, IFindCommandOptions} from './commands/find-command';
import {Filter} from '../types/mongo-types';
import {IInsertOneCommandOptions, InsertOneCommand} from './commands/insert-one-command';

interface ICollectionPrivate {
  options: ICollectionOptions;
  db: Db;
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export class Collection<T = Document> implements ICollection<T, IDBDatabase> {
  /**
   * @internal
   */
  [kOptions]: ICollectionOptions;

  private s: ICollectionPrivate;

  get options(): Readonly<ICollectionOptions> {
    return Object.freeze({...this[kOptions]});
  }

  get db(): Db {
    return this.s.db;
  }

  get name(): string {
    return this.s.options.name;
  }

  constructor(db: Db, name: string, options?: Partial<ICollectionOptions>) {

    this[kOptions] = parseCollectionOptions({
      ...options,
      name,
    });

    // eslint-disable-next-line @typescript-eslint/no-this-alias
    const collection = this;

    this.s = {
      db,
      get options(): ICollectionOptions {
        return collection.options;
      },
    };

  }

  find(filter: Filter<T>, options: IFindCommandOptions): Promise<T[]> {
    return executeCommand<T[]>(new FindCommand<T>(this, filter, options));
  }

  insertOne(data: T, options: IInsertOneCommandOptions): Promise<T> {
    return executeCommand<T>(new InsertOneCommand<T>(this, data, options));
  }

  async findById(id: string): Promise<T> {
    throw Error('Not implemented ' + id);
    // return this.getIdbStore().then((store) => {
    //   const request = store.get(id);
    //
    //   return new Promise((resolve => {
    //     request.onsuccess = () => {
    //       resolve(request.result);
    //     };
    //   }));
    //
    // });
  }

}
