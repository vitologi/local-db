import { IDbClientOptions } from '../interfaces';
import { IndexedDbProvider } from "../models/idb/indexed-db-provider";

export function parseClientOptions(options?: Partial<IDbClientOptions>): IDbClientOptions {
    return Object.assign({
        dbName: 'db',
        provider: IndexedDbProvider,
    }, options);
}
