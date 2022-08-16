import {
    IDbOptions,
    ICollectionOptions,
    IDb,
    IDbInsertOptions,
    IDbFindOptions,
    kOptions,
    ICollection,
    IDbClient,
    IDbProvider,
    ICreateCollectionOptions,
    IDropCollectionOptions,
    IDbInsertResult,
    IDbDeleteOptions, IDbDeleteResult, IDbUpdateOptions, IDbUpdateResult, IFindCallback
} from '../interfaces';
import { parseDbOptions } from '../utils/parse-db-options';
import { Collection } from './collection';
import { DbStatus } from '../enums';
import { Callback } from "../types/callback";


interface IDbPrivate {
    status: DbStatus;
    options: IDbOptions;
    client: IDbClient;
}

export class Db implements IDb {
    [kOptions]: IDbOptions;

    get options(): Readonly<IDbOptions> {
        return Object.freeze({...this[kOptions]});
    }

    get status(): DbStatus {
        return this.s.status;
    }

    get name(): string {
        return this.s.options.name;
    }

    get client(): IDbClient {
        return this.s.client;
    }

    get provider(): IDbProvider {
        return this[kOptions].provider;
    }

    private s: IDbPrivate;

    // private collections = new Map<string, Collection>();

    constructor(name: string, options?: Partial<IDbOptions>) {
        this[kOptions] = parseDbOptions(this, {
            ...(options || {}),
            name,
        });

        // eslint-disable-next-line @typescript-eslint/no-this-alias
        const db = this;

        this.s = {
            client: this[kOptions].client || null,
            status: DbStatus.Closed,
            get options(): IDbOptions {
                return db.options;
            },
        };

        this.provider.onStatusChanges((value) => {
            this.setStatus(value);
        });
    }

    collection<TSchema>(name: string, options?: Partial<ICollectionOptions>): ICollection<TSchema> {
        return new Collection<TSchema>(this, name, options);
    }

    hasCollection(name: string): Promise<boolean> {
        return this.provider.hasCollection(name);
    }

    createCollection(name: string, options?: ICreateCollectionOptions, callback?: (error?: Error) => void): Promise<void> {
        const finalOptions: ICreateCollectionOptions = Object.assign({
            autoIncrement: false,
            keyPath: null,
        }, options || {});

        return this.provider.createCollection(name, finalOptions, callback);
    }

    dropCollection(name: string, options?: IDropCollectionOptions, callback?: (error?: Error) => void): Promise<void> {
        const finalOptions: IDropCollectionOptions = Object.assign({
            dependencyGuard: false,
        }, options || {});
        return this.provider.dropCollection(name, finalOptions, callback);
    }

    async open(): Promise<this> {
        return this.provider.open().then(() => this);
    }

    async find<TSource, TResult>(cb: IFindCallback<TSource, TResult>, options: IDbFindOptions): Promise<TResult[]> {
        const {collection, throttle = false, indexes = []} = options;
        return this.provider.find<TSource, TResult>(cb, {
            collection: collection.name,
            throttle,
            indexes,
        });
    }

    async insert<TSchema>(docs: TSchema[], options: IDbInsertOptions, cb?: Callback<IDbInsertResult<TSchema>>): Promise<IDbInsertResult<TSchema>> {
        const {collection} = options;
        return this.provider.insert<TSchema>(docs, {collection: collection.name}, cb);
    }

    async update<TSchema>(docs: TSchema[], options: IDbUpdateOptions, cb?: Callback<IDbUpdateResult<TSchema>>): Promise<IDbUpdateResult<TSchema>> {
        const {collection} = options;
        return this.provider.update<TSchema>(docs, {collection: collection.name}, cb);
    }

    async delete<TId>(docs: TId[], options: IDbDeleteOptions, cb?: Callback<IDbDeleteResult>): Promise<IDbDeleteResult> {
        const {collection} = options;
        return this.provider.delete<TId>(docs, {collection: collection.name}, cb);
    }

    private setStatus(status: DbStatus): void {
        this.s.status = status;
    }
}
