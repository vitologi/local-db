import { Db, DbStatus, IDb, IDbMigration } from "../../src";
import { generateMigration } from "../mocks/generate-migration";
import { ITestItem } from "../mocks/test-item.interface";
import { assertDefined } from "../mocks/assert-defined";
import { generateTestItems } from "../mocks/generate-test-items";

describe('IDbMigration', () => {
    let db: IDb;

    test('Apply three migrations without rows', async () => {
        const colNames = [1, 2, 3].map((index) => `CollectionNo${index}`);
        const migrations: IDbMigration[] = colNames.map((name) => generateMigration(name));
        db = new Db('TestDb', {migrations});
        await db.open();
        expect(db.status).toBe(DbStatus.Opened);

        for (const name of colNames) {
            const collectionExists = await db.hasCollection(name);
            expect(collectionExists).toBe(true);
        }
    });

    test('Apply three migrations with 3 rows', async () => {
        const colNames = [1, 2, 3].map((index) => `CollectionNo${index}`);
        const rows:ITestItem[] = generateTestItems(3);
        const migrations: IDbMigration[] = colNames.map((name) => generateMigration(name, rows));
        db = new Db('TestDb2', {migrations});
        await db.open();
        expect(db.status).toBe(DbStatus.Opened);

        for (const name of colNames) {
            const collectionExists = await db.hasCollection(name);
            expect(collectionExists).toBe(true);

            const collection = db.collection<ITestItem>(name);
            for(const row of rows){
                let item = await collection.findOne({_id: row._id});
                item = assertDefined(item);
                expect(item.title).toBe(row.title);
            }
        }

    });
});
