import {ICommand} from '../interfaces';

export function executeCommand<T>(command: ICommand<T>): Promise<T> {
  return command.execute();
}
