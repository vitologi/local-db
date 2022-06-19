/**
 * @public
 */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export type Callback<T = any> = (error?: Error, result?: T) => void;
