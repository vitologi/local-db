import {ICollectionOptions} from '../interfaces';

export function parseCollectionOptions(options?: Partial<ICollectionOptions>): ICollectionOptions {
  return Object.assign({name: 'default'}, options);
}
