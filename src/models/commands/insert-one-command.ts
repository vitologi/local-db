import {AbstractCommand} from './abstract-command';
import {ICollection} from '../../interfaces/collection';

export interface IInsertOneCommandOptions {
  bypassDocumentValidation?: boolean;
}

export class InsertOneCommand<TSchema> extends AbstractCommand<TSchema> {
  readonly options: IInsertOneCommandOptions;
  readonly data: TSchema;

  constructor(
    collection: ICollection<TSchema>,
    data: TSchema,
    options: IInsertOneCommandOptions = {},
  ) {
    super(collection);
    this.data = data;
    this.options = options;
  }

  async execute<T = string>(): Promise<T> {
    const collection = this.collection;
    return collection.db.add(this.data, {collection});
  }

}
