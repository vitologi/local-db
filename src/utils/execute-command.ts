import {ICommand} from '../interfaces/command';

export function executeCommand<T>(command: ICommand<T>): Promise<T> {
  return command.execute();
}
