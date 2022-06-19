import {ICommand} from '../../interfaces/command';
import {ICollection} from '../../interfaces/collection';

export abstract class AbstractCommand<TSchema> implements ICommand<TSchema> {
  abstract execute<T = TSchema>(): Promise<T>;

  protected collection: ICollection<TSchema>;

  protected constructor(collection: ICollection<TSchema>) {
    this.collection = collection;
  }
}
