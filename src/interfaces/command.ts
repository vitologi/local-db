// eslint-disable-next-line @typescript-eslint/no-explicit-any
export interface ICommand<TSchema = any>{
  execute(): Promise<TSchema>;
}
