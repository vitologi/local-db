import { find } from "mingo";
import { AbstractCommand } from './abstract-command';
import { ICollection, IDbDeleteResult } from '../../interfaces';
import { Filter, InferIdType, WithId } from "../../types/mongo-types";

export interface IDeleteCommandOptions {
    limit?: number;
}

export interface IDeleteCommandResult extends IDbDeleteResult {

}

export class DeleteCommand<TSchema> extends AbstractCommand<IDeleteCommandResult, TSchema> {
    readonly filter: Filter<TSchema>;
    readonly options: IDeleteCommandOptions;

    constructor(
        collection: ICollection<any>,
        filter: Filter<TSchema> = {},
        options: IDeleteCommandOptions = {},
    ) {
        super(collection);
        this.filter = filter;
        this.options = options;
    }

    async execute(): Promise<IDeleteCommandResult> {
        const collection = this.collection;
        const {db} = collection;
        const {limit} = this.options;
        const filter = this.filter;
        const items = await db.find((item: TSchema) => {
            return {done: false, value: item};
        }, {collection, throttle: false});
        const filtered = find(items, filter).all() as WithId<TSchema>[];

        if (filtered.length === 0) {
            return {deletedCount: 0};
        }

        const ids = filtered.map((item) => item._id);
        const limitedIds = limit ? ids.slice(0, limit) : ids;
        return db.delete<InferIdType<TSchema>>(limitedIds, {collection});
    }
}


export interface IDeleteOneCommandOptions {

}

export interface IDeleteOneCommandResult extends IDeleteCommandResult {

}

export class DeleteOneCommand<TSchema> extends DeleteCommand<TSchema> {

    constructor(
        collection: ICollection<TSchema>,
        filter: Filter<TSchema> = {},
        options: IDeleteOneCommandOptions = {},
    ) {
        super(collection, filter, {...options, limit: 1});
    }
}
