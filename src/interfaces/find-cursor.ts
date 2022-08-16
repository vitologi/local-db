import { Callback } from "../types/callback";
import { ICursor } from "./cursor";
import { Filter } from "../types/mongo-types";
import { Sort, SortDirection } from "../types/sort";

export type Hint = string | Record<string, 1 | -1>;

export interface CollationOptions {
    locale: string;
    caseLevel?: boolean;
    caseFirst?: string;
    strength?: number;
    numericOrdering?: boolean;
    alternate?: string;
    maxVariable?: string;
    backwards?: boolean;
    normalization?: boolean;
}

export interface IFindCursor<TSchema> extends ICursor<TSchema> {
    count(callback?: Callback<number>): Promise<number>;

    filter(filter: Filter<TSchema>): IFindCursor<TSchema>;

    hint(hint: Hint): IFindCursor<TSchema>;

    project<T extends object = object>(value: object): IFindCursor<T>;  // TODO: specify project params

    sort(sort: Sort | string, direction?: SortDirection): IFindCursor<TSchema>;

    collation(value: CollationOptions): IFindCursor<TSchema>;

    limit(value: number): IFindCursor<TSchema>;

    skip(value: number): IFindCursor<TSchema>;
}
