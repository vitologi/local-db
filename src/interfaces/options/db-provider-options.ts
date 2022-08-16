import {IDbClientOptions} from './db-client-options';
import {IDbMigration} from '../db-migration';

export interface IDbOptions extends IDbClientOptions {
  migrations: Array<IDbMigration>;
}
