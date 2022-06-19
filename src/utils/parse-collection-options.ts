import {ICollectionOptions} from '../interfaces/collection-options';

export function parseCollectionOptions(options?: Partial<ICollectionOptions>): ICollectionOptions {
  return Object.assign({name: 'default'}, options);
}
