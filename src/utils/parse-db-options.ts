import { IDb, IDbMigration, IDbOptions } from '../interfaces';
import { DbClient, IndexedDbProvider } from "../models";
import { migrationsToProviderMigrations } from "./migrations-to-provider-migrations";

export function parseDbOptions(db: IDb, options?: Partial<IDbOptions>): IDbOptions {
    let {name,client,migrations,provider} = Object.assign({
        name: 'db',
        migrations: [] as IDbMigration[],
        client: new DbClient(), // TODO: generate singleton for client
    }, options);


    if (typeof provider === 'function' || !provider) {
        provider = new IndexedDbProvider({
            name,
            migrations: migrationsToProviderMigrations(migrations, db),
        });
    }

    return {name,client,migrations, provider};
}
