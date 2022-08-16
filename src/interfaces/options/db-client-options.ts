import { IDbProvidedConstructor } from "../db-provider";

export interface IDbClientOptions {
    dbName: string;
    provider: IDbProvidedConstructor;
}
