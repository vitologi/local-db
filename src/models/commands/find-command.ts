import { find } from 'mingo';
import { RawObject } from 'mingo/types';
import { AbstractCommand } from './abstract-command';
import { ICollection, IPaginationOptions, ISortOptions } from '../../interfaces';
import { Filter } from '../../types/mongo-types';

export interface IFindCommandOptions extends Partial<IPaginationOptions>, Partial<ISortOptions> {
    throttle?: boolean;
    // TODO: include key visibility (projection) (view also) like {_id:0,name:1}
}

export type TFindCommandResult<T> = T[];

export class FindCommand<TSchema> extends AbstractCommand<TFindCommandResult<TSchema>, TSchema> {
    readonly filter: Filter<TSchema>;
    readonly options: IFindCommandOptions;

    constructor(
        collection: ICollection<TSchema>,
        filter: Filter<TSchema> = {},
        options: IFindCommandOptions = {},
    ) {
        super(collection);
        this.filter = filter;
        this.options = options;
    }

    async execute(): Promise<TFindCommandResult<TSchema>> {
        const collection = this.collection;
        const filter = this.filter;
        const {sort, skip, limit, throttle} = this.options;

        const allItems = await collection.db.find((item: TSchema) => {
            return {done: false, value: item};
        }, {collection, throttle});

        let cursor = find(allItems, filter);

        if (sort) {
            cursor = cursor.sort(sort as RawObject);
        }
        if (skip) {
            cursor = cursor.skip(skip);
        }
        if (limit) {
            cursor = cursor.limit(limit);
        }

        return cursor.all() as TFindCommandResult<TSchema>;
    }

}

export interface IFindOneCommandOptions extends IFindCommandOptions{

}

export type TFindOneCommandResult<T> = T | null;

export class FindOneCommand<TSchema> extends AbstractCommand<TFindOneCommandResult<TSchema>, TSchema> {
    private findCommand: FindCommand<TSchema>;

    constructor(
        collection: ICollection<TSchema>,
        filter: Filter<TSchema> = {},
        options: IFindOneCommandOptions = {},
    ) {
        super(collection);
        this.findCommand = new FindCommand<TSchema>(collection, filter, {...options, limit: 1, throttle: true});
    }

    async execute(): Promise<TFindOneCommandResult<TSchema>> {
        const result = await this.findCommand.execute();
        return result[0] || null;
    }

}
