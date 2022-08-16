import { IDbMigration } from '../db-migration';
import { IDbProvider } from "../db-provider";
import { IDbClient } from "../db-client";

export interface IDbOptions {
    name: string;
    provider: IDbProvider;
    client: IDbClient;
    migrations: Array<IDbMigration>;
}
