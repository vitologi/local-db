import { AbstractCursor } from "./abstract-cursor";
import { CollationOptions, Hint, IFindCursor } from "../interfaces/find-cursor";
import { Callback } from "../types/callback";
import { Filter } from "../types/mongo-types";
import { Sort, SortDirection } from "../types/sort";

export class FindCursor<TSchema> extends AbstractCursor<TSchema> implements IFindCursor<TSchema> {
    collation(value: CollationOptions): IFindCursor<TSchema> {
        console.log(value);
        throw new Error('implement it');
    }

    count(callback?: Callback<number>): Promise<number> {
        console.log(callback);
        throw new Error('implement it');
        // return Promise.resolve(0);
    }

    filter(filter: Filter<TSchema>): IFindCursor<TSchema> {
        console.log(filter);
        throw new Error('implement it');
    }

    hint(hint: Hint): IFindCursor<TSchema> {
        console.log(hint);
        throw new Error('implement it');
        //
    }

    limit(value: number): IFindCursor<TSchema> {
        console.log(value);
        throw new Error('implement it');
    }

    project<T  extends object>(value: object): IFindCursor<T> {
        console.log(value);
        throw new Error('implement it');
    }

    skip(value: number): IFindCursor<TSchema> {
        console.log(value);
        throw new Error('implement it');
    }

    sort(sort: Sort | string, direction?: SortDirection): IFindCursor<TSchema> {
        console.log(sort, direction);
        throw new Error('implement it');
    }

    hasNext(callback: Callback<boolean> | undefined): Promise<boolean> {
        console.log(callback);
        throw new Error('implement it');
        // return Promise.resolve(false);
    }

    next(callback?: Callback<TSchema | null>): Promise<TSchema | null> {
        console.log(callback);
        throw new Error('implement it');
        // return Promise.resolve(undefined);
    }

}
