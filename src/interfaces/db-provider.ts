import { DbStatus } from "../enums";
import { InferIdType } from "../types/mongo-types";
import { Callback } from "../types/callback";

export interface IDbProviderMigration {
    up(): Promise<void>;

    down(): Promise<void>;
}

export interface IInitOptions {
    name: string;
    migrations: IDbProviderMigration[];
}

export interface IFindOptions extends IDbIteratorOptions {
    throttle: boolean;
}

export type IFindCallback<TSrc, TResult> = (arg: TSrc) => {done: false; value: TResult} | {done: true};

export interface ICreateCollectionOptions {
    autoIncrement?: boolean;
    keyPath?: string | string[] | null;
    // TODO: include {viewOn: string; pipeline:[];collation:{}}
}

export interface IDropCollectionOptions {
    dependencyGuard?: boolean;
}

export interface IInsertOptions {
    collection: string;
}

export interface IUpdateOptions {
    collection: string;
}

export interface IDeleteOptions {
    collection: string;
}

export interface IInsertResult<TSchema> {
    insertedCount: number;
    insertedIds: { [key: number]: InferIdType<TSchema> };
}

export interface IUpdateResult<TSchema> {
    matchedCount: number;
    upsertedCount: number;
    upsertedIds: { [key: number]: InferIdType<TSchema> };
}

export interface IDeleteResult {
    deletedCount: number;
}

export interface IDbProvidedConstructor {
    new(options: IInitOptions): IDbProvider;
}

export interface IDbIteratorOptions {
    collection: string;
    indexes: string[];
}

export interface IDbProvider<TDb = any, TTransaction = any> {
    name: string;
    status: DbStatus;
    transaction: TTransaction | null;

    getDBVersion(name: string): Promise<number>;

    open(): Promise<this>;

    source(): Promise<TDb>;

    hasCollection(name: string): Promise<boolean>;

    createCollection<TOptions extends ICreateCollectionOptions>(name: string, options?: TOptions, callback?: (error?: Error) => void): Promise<void>;

    dropCollection<TOptions extends IDropCollectionOptions>(name: string, options?: TOptions, callback?: (error?: Error) => void): Promise<void>;

    find<TInitialSchema, TResultSchema>(cb: IFindCallback<TInitialSchema, TResultSchema>, options?: IFindOptions): Promise<TResultSchema[]>;

    insert<TSchema>(values: TSchema[], options?: IInsertOptions, callback?: Callback<IInsertResult<TSchema>>): Promise<IInsertResult<TSchema>>;

    update<TSchema>(values: TSchema[], options?: IUpdateOptions, callback?: Callback<IUpdateResult<TSchema>>): Promise<IUpdateResult<TSchema>>;

    delete<TId>(values: TId[], options?: IDeleteOptions, callback?: Callback<IDeleteResult>): Promise<IDeleteResult>;

    onStatusChanges(callback: (value: DbStatus) => void): () => void;

    getIterator<TSchema>(options?: IDbIteratorOptions): Promise<Iterable<TSchema>>;

    getAsyncIterator<TSchema>(options?: IDbIteratorOptions): AsyncIterable<TSchema>;
}
