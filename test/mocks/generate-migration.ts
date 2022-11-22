import { IDb, IDbMigration } from "../../src";
import { ITestItem } from "./test-item.interface";

export const generateMigration = <T extends ITestItem>(collectionName: string, rows: T[] = [], hasLogs = false): IDbMigration =>{
    return {
        async up(db: IDb): Promise<void> {
            if(hasLogs){
                console.log(`+ IDb.createCollection ${collectionName}`);
            }
            await db.createCollection(collectionName, {keyPath: '_id'});
            if(hasLogs){
                console.log(`- IDb.createCollection ${collectionName}`);
            }

            const collection = db.collection(collectionName);
            for(const row of rows){
                await collection.insertOne(row);
                if(hasLogs){
                    console.log(`+ ICollection.insertOne ${collectionName}.${row.title}`);
                }
            }
        },
        async down(db: IDb): Promise<void> {
            if(hasLogs){
                console.log(`+ IDb.dropCollection ${collectionName}`);
            }
            await db.dropCollection(collectionName);
            if(hasLogs){
                console.log(`- IDb.dropCollection ${collectionName}`);
            }
        }
    }
};
