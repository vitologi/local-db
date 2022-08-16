import { find } from "mingo";
import { AbstractCommand } from './abstract-command';
import { ICollection, IDbUpdateResult } from '../../interfaces';
import { Filter, UpdateFilter } from "../../types/mongo-types";

export interface IUpdateCommandOptions {
    limit?: number;
    bypassDocumentValidation?: boolean;
}

export interface IUpdateCommandResult<TSchema> extends IDbUpdateResult<TSchema> {
}

function omitExpressionProps(obj: object): { [key: string]: any } {
    return Object.entries(obj).reduce((acc, [key, value]) => {
        return (key[0] !== '$') ? {[key]: value, ...acc} : acc;
    }, {});
}

export class UpdateCommand<TSchema> extends AbstractCommand<IUpdateCommandResult<TSchema>, TSchema> {
    readonly options: IUpdateCommandOptions;
    readonly filter: Filter<TSchema>;
    readonly update: UpdateFilter<TSchema>;

    constructor(
        collection: ICollection<TSchema>,
        filter: Filter<TSchema>,
        update: UpdateFilter<TSchema>,
        options: IUpdateCommandOptions = {},
    ) {
        super(collection);

        this.filter = filter;
        this.update = update;
        this.options = options;
    }

    async execute(): Promise<IUpdateCommandResult<TSchema>> {
        const collection = this.collection;
        const filter = this.filter;
        const update = this.update;
        const {limit, bypassDocumentValidation = true} = this.options;

        const allItems = await collection.db.find((item: TSchema) => {
            return {done: false, value: item};
        }, {collection, throttle: false});

        let cursor = find(allItems, filter);
        if (limit) {
            cursor = cursor.limit(limit);
        }
        const itemsToUpdate = cursor.all() as TSchema[];

        const documentProps = omitExpressionProps(update);

        const updatedItems = itemsToUpdate.map((item) => {
            return {
                ...item,
                ...documentProps,
            };
        })

        if (!bypassDocumentValidation) {
            console.log('TODO: implement it using db', collection.db);
        }

        // TODO: implement response verification
        return collection.db.update<TSchema>(updatedItems, {collection});
    }

}

export interface IUpdateOneCommandOptions {
    bypassDocumentValidation?: boolean;
}

export interface IUpdateOneCommandResult<TSchema> extends IUpdateCommandResult<TSchema> {

}

export class UpdateOneCommand<TSchema> extends UpdateCommand<TSchema> {
    constructor(
        collection: ICollection<TSchema>,
        filter: Filter<TSchema>,
        update: UpdateFilter<TSchema>,
        options: IUpdateOneCommandOptions = {},
    ) {
        super(collection, filter, update, {...options, limit: 1});
    }
}
