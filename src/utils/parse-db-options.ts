import { IDb, IDbMigration, IDbOptions } from '../interfaces';
import { IndexedDbProvider } from "../models/idb/indexed-db-provider";
import { DbClient } from "../models/db-client";
import { migrationsToProviderMigrations } from "./migrations-to-provider-migrations";

export function parseDbOptions(db: IDb, options?: Partial<IDbOptions>): IDbOptions {
    const resultOptions = Object.assign({
        name: 'db',
        migrations: [] as IDbMigration[],
        client: new DbClient(), // TODO: generate singleton for client
    }, options);


    resultOptions.provider = resultOptions.provider || new IndexedDbProvider({
        name: resultOptions.name,
        migrations: migrationsToProviderMigrations(resultOptions.migrations, db),
    });

    // TODO: fix this file include typescript bug
    return resultOptions as IDbOptions;
}
