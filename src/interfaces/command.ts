// eslint-disable-next-line @typescript-eslint/no-explicit-any
export interface ICommand<TOut = any>{
  execute(): Promise<TOut>;
}
