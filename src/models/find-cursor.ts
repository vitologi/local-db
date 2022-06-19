import { AbstractCursor } from "./abstract-cursor";
import { IFindCursor } from "../interfaces/find-cursor";
import { Callback } from "../types/callback";

export class FindCursor<TSchema> extends AbstractCursor<TSchema> implements IFindCursor<TSchema> {
    collation(value: CollationOptions): IFindCursor<TSchema> {
        return undefined;
    }

    count(callback?: Callback<number>): Promise<number> {
        return Promise.resolve(0);
    }

    filter(filter: Filter<TSchema>): IFindCursor<TSchema> {
        return undefined;
    }

    hint(hint: Hint): IFindCursor<TSchema> {
        return undefined;
    }

    limit(value: number): IFindCursor<TSchema> {
        return undefined;
    }

    project<T = object extends object>(value: object): IFindCursor<T> {
        return undefined;
    }

    skip(value: number): IFindCursor<TSchema> {
        return undefined;
    }

    sort(sort: Sort | string, direction?: SortDirection): IFindCursor<TSchema> {
        return undefined;
    }

}
