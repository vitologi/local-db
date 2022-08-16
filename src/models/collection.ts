import { ICollection, kOptions } from '../interfaces/collection';
import { ICollectionOptions, IDb } from '../interfaces';
import { parseCollectionOptions } from '../utils/parse-collection-options';
import { executeCommand } from '../utils/execute-command';
import {
    FindCommand, FindOneCommand,
    IFindCommandOptions,
    IFindOneCommandOptions,
    TFindCommandResult,
    TFindOneCommandResult
} from './commands/find-command';
import { Filter, UpdateFilter } from '../types/mongo-types';
import { IInsertOneCommandOptions, IInsertOneCommandResult, InsertOneCommand } from "./commands/insert-command";
import { DeleteOneCommand, IDeleteOneCommandOptions, IDeleteOneCommandResult } from "./commands/delete-command";
import { IUpdateOneCommandOptions, IUpdateOneCommandResult, UpdateOneCommand } from "./commands/update-command";


interface ICollectionPrivate {
    options: ICollectionOptions;
    db: IDb;
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export class Collection<T = Record<string, any>> implements ICollection<T> {
    /**
     * @internal
     */
    [kOptions]: ICollectionOptions;

    private s: ICollectionPrivate;

    get options(): Readonly<ICollectionOptions> {
        return Object.freeze({...this[kOptions]});
    }

    get db(): IDb {
        return this.s.db;
    }

    get name(): string {
        return this.s.options.name;
    }

    constructor(db: IDb, name: string, options?: Partial<ICollectionOptions>) {

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

    find(filter: Filter<T>, options: IFindCommandOptions): Promise<TFindCommandResult<T>> {
        return executeCommand(new FindCommand<T>(this, filter, options));
    }

    findOne(filter: Filter<T>, options?: IFindOneCommandOptions): Promise<TFindOneCommandResult<T>> {
        return executeCommand(new FindOneCommand<T>(this, filter, options));
    }

    insertOne(data: T, options: IInsertOneCommandOptions): Promise<IInsertOneCommandResult<T>> {
        return executeCommand(new InsertOneCommand<T>(this, data, options));
    }

    updateOne(filter: Filter<T>, update: UpdateFilter<T>, options: IUpdateOneCommandOptions): Promise<IUpdateOneCommandResult<T>> {
        return executeCommand(new UpdateOneCommand<T>(this, filter, update, options));
    }

    deleteOne(filter: Filter<T>, options?: IDeleteOneCommandOptions): Promise<IDeleteOneCommandResult> {
        return executeCommand(new DeleteOneCommand<T>(this, filter, options));
    }

}
