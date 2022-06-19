import { ICursor, ICursorOptions, ICursorStreamOptions } from "../interfaces/cursor";
import { Callback } from "../types/callback";

export const kInitialized = Symbol('kInitialized');
export const kDocuments = Symbol('kDocuments');
export const kClosed = Symbol('kClosed');
export const kOptions = Symbol('kOptions');
export const kKilled = Symbol('kKilled');
export const kSource = Symbol('kSource');

type TSource<TSchema> = Iterable<TSchema> | AsyncIterable<TSchema>; // TODO: add | ReadableStream<TSchema>;

function toAsyncIterable<T>(src: Iterable<T>): AsyncIterable<T> {
    const iterator = src[Symbol.iterator]();

    return {
        async* [Symbol.asyncIterator]() {
            return iterator.next();
        }
    }
}

export abstract class AbstractCursor<TSchema> implements ICursor<TSchema> {
    [kSource]: AsyncIterable<TSchema>;
    [kInitialized]: boolean = false;
    [kClosed]: boolean = false;
    [kKilled]: boolean = false;
    [kOptions]: ICursorOptions;
    [kDocuments]: TSchema[] = [];
    private currentIndex: number = 0;

    get options(): Readonly<ICursorOptions> {
        return Object.freeze({...this[kOptions]});
    }

    constructor(source: TSource<TSchema>, options?: ICursorOptions) {
        this[kOptions] = Object.assign({}, options);
        this[kSource] = isIterable(source) ? toAsyncIterable(source) : source;
    }

    [Symbol.iterator](): Iterator<TSchema> {
        return undefined;
    }

    [Symbol.asyncIterator](): AsyncIterator<TSchema> {
        return undefined;
    }

    clone(): ICursor<TSchema> {
        return undefined;
    }

    close(callback?: Callback): Promise<void> {
        return Promise.resolve(undefined);
    }

    forEach(iterator: (doc: TSchema) => boolean, callback?: Callback<void>): Promise<void> {
        return Promise.resolve(undefined);
    }

    abstract hasNext(callback?: Callback<boolean>): Promise<boolean>;

    map<T = any>(transform: (doc: TSchema) => T): ICursor<T> {
        return undefined;
    }

    abstract next(callback?: Callback<TSchema | null>): Promise<TSchema | null>;

    rewind(): void {
    }

    stream(options?: ICursorStreamOptions): AsyncIterable<TSchema> {    // TODO: add Readable return
        return undefined;
    }

    async toArray(callback?: Callback<TSchema[]>): Promise<TSchema[]> {
        const result = [];

        try {
            for await (const value of this[kSource]) {
                result.push(value);
            }
            if (callback) {
                callback(undefined, result);
            }
        } catch () {
            if (callback) {
                callback(new Error(`Can't parse cursor to array`), result);
            }
        }

        return result;
    }

    tryNext(callback?: Callback<TSchema | null>): Promise<TSchema | null> {
        return Promise.resolve(undefined);
    }

}
