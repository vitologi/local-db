import { IDbClientOptions } from '../interfaces';
import { IndexedDbProvider } from "../models";

export function parseClientOptions(options?: Partial<IDbClientOptions>): IDbClientOptions {
    return Object.assign({
        dbName: 'db',
        provider: IndexedDbProvider,
    }, options);
}
