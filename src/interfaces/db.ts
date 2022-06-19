import { IDbOptions } from './options/db-options';
import { ICollectionOptions } from './options/collection-options';
import { ICollection } from './collection';
import { DbStatus } from "../enums";
import { IDbClient } from "./db-client";
import {
    IDbProvider,
    IDeleteResult,
    IDropCollectionOptions,
    IFindCallback,
    IInsertResult,
    IUpdateResult
} from "./db-provider";
import { Callback } from "../types/callback";

export const kOptions = Symbol('options');

export interface IDbFindOptions {
    collection: ICollection<any>;
    throttle?: boolean;
    indexes?: string[];
}

export interface IDbInsertOptions {
    collection: ICollection<any>;
    limit?: number;
}

export interface IDbUpdateOptions {
    collection: ICollection<any>;
    bypassDocumentValidation?: boolean; // If true, allows the write to opt-out of document level validation
    upsert?: boolean;   // When true, creates a new document if no document matches the query
}

export interface IDbDeleteOptions {
    collection: ICollection<any>;
}

export interface IDbInsertResult<TSchema> extends IInsertResult<TSchema> {
}

export interface IDbUpdateResult<TSchema> extends IUpdateResult<TSchema> {
}

export interface IDbDeleteResult extends IDeleteResult {
}

export interface IDb {
    [kOptions]: IDbOptions;

    options: Readonly<IDbOptions>;
    name: string;
    client: IDbClient;
    provider: IDbProvider;
    status: DbStatus;

    open(): Promise<this>;

    collection<T>(name: string, options?: Partial<ICollectionOptions>): ICollection<T>;

    hasCollection(name: string): Promise<boolean>;

    createCollection(name: string, options?: IDBObjectStoreParameters, callback?: (error?: Error) => void): Promise<void>; // TODO: create own options (use generic)
    dropCollection(name: string, options?: IDropCollectionOptions, callback?: (error?: Error) => void): Promise<void>;

    find<TInitialDoc, TResultDoc>(cb: IFindCallback<TInitialDoc, TResultDoc>, options: IDbFindOptions): Promise<TResultDoc[]>;

    insert<TSchema>(docs: TSchema[], options: IDbInsertOptions, callback?: Callback<IDbInsertResult<TSchema>>): Promise<IDbInsertResult<TSchema>>;

    update<TSchema>(docs: TSchema[], options: IDbUpdateOptions, callback?: Callback<IDbUpdateResult<TSchema>>): Promise<IDbUpdateResult<TSchema>>;

    delete<TId = string>(docs: TId[], options: IDbDeleteOptions, callback?: Callback<IDbDeleteResult>): Promise<IDbDeleteResult>;
}
