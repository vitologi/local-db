import {AbstractCommand} from './abstract-command';
import {ICollection} from '../../interfaces/collection';
import {IPaginationOptions} from '../../interfaces/pagination-options';
import {find} from 'mingo';
import {Filter} from '../../types/mongo-types';
import {ISortOptions} from '../../interfaces/sort-options';
import {RawObject} from 'mingo/types';

export interface IFindCommandOptions extends Partial<IPaginationOptions>, Partial<ISortOptions> {

}

export class FindCommand<TSchema> extends AbstractCommand<TSchema> {
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

  async execute<T = TSchema[]>(): Promise<T> {
    const collection = this.collection;
    const filter = this.filter;
    const {sort, skip, limit} = this.options;

    const filtered = await collection.db.filter((items: TSchema[]) => {
      return find(items, filter).all() ;
    }, {collection, throttle: 5});

    let cursor = find(filtered, {});

    if (sort) {
      cursor = cursor.sort(sort as RawObject);
    }
    if (skip) {
      cursor = cursor.skip(skip);
    }
    if (limit) {
      cursor = cursor.limit(limit);
    }

    return cursor.all() as unknown as T;
  }

}
