import {IDbOptions} from '../interfaces/db-options';

export function parseDbOptions(options?: Partial<IDbOptions>): IDbOptions {
  return Object.assign({dbName: 'db', migrations: []}, options);
}
