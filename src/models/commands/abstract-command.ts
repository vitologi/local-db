import { ICommand, ICollection } from '../../interfaces';

export abstract class AbstractCommand<TOut, TSchema = any> implements ICommand<TOut> {
    abstract execute(): Promise<TOut>;

    protected collection: ICollection<TSchema>;

    protected constructor(collection: ICollection<TSchema>) {
        this.collection = collection;
    }
}
