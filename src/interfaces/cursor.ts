import { Callback } from "../types/callback";
import { Readable } from "stream";

type Document = object;

export interface ICursorOptions {
}

export interface ICursorStreamOptions {
    /** A transformation method applied to each document emitted by the stream */
    transform?(this: void, doc: Document): Document;
}

export interface ICursor<TSchema> extends AsyncIterable<TSchema>, Iterable<TSchema> {
    clone(): ICursor<TSchema>;
    map<T = any>(transform: (doc: TSchema) => T): ICursor<T>;
    tryNext(callback?: Callback<TSchema | null>): Promise<TSchema | null>;
    next(callback?: Callback<TSchema | null>): Promise<TSchema | null>;
    hasNext(callback?: Callback<boolean>): Promise<boolean>;
    toArray(callback?: Callback<TSchema[]>): Promise<TSchema[]>;
    forEach(iterator: (doc: TSchema) => boolean, callback?: Callback<void>): Promise<void>;
    close(callback?: Callback): Promise<void>;
    rewind(): void;
    stream(options?: ICursorStreamOptions): Readable & AsyncIterable<TSchema>;

    // TODO: implement it later
    // maxTimeMS	(value: number): this
    // addCursorFlag	(flag: CursorFlag, value: boolean): this
    // withReadPreference	(readPreference: ReadPreferenceLike): this
    // withReadConcern	(readConcern: ReadConcernLike): this
    // batchSize	(value: number): this
}
