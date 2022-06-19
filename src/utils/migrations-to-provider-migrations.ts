import { IDb, IDbMigration, IDbProviderMigration } from "../interfaces";

export function migrationsToProviderMigrations(migrations: IDbMigration[], db: IDb): IDbProviderMigration[] {
    return migrations.map((migration) => ({
        up: migration.up.bind(db, db),
        down: migration.down.bind(db, db),
    }));
}
