import {IDb} from "./db";

export interface IDbMigration {
  up(db: IDb): Promise<void>;

  down(db: IDb): Promise<void>;
}
