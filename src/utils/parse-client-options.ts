import {IDbClientOptions} from '../interfaces/db-client-options';

export function parseClientOptions(options?: Partial<IDbClientOptions>): IDbClientOptions {
  return Object.assign({dbName: 'db'},  options);
}
