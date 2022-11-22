import { Db, DbStatus, IDb, IDbMigration } from "../../src";
import { generateMigration } from "../mocks/generate-migration";

describe('Db', () => {

    const collectionName = 'FirstCollection';
    const migrations: IDbMigration[] = [generateMigration(collectionName)];

    let db: IDb;
    beforeAll(async () => {
        db = new Db('TestDb', {migrations});
    })

    test('Initial status should be "Closed"', async () => {
        expect(db.status).toBe(DbStatus.Closed);
    });

    test('IDb.hasCollection', async () => {
        const spyIsCollectionExists = jest.fn();
        const spyIsFakeCollectionExists = jest.fn();
        db.hasCollection(collectionName).then(spyIsCollectionExists);
        db.hasCollection('FakeCollection').then(spyIsFakeCollectionExists);

        expect(spyIsCollectionExists).not.toHaveBeenCalled();
        expect(spyIsFakeCollectionExists).not.toHaveBeenCalled();

        await db.open();

        expect(spyIsCollectionExists).toHaveBeenCalledWith(true);
        expect(spyIsFakeCollectionExists).toHaveBeenCalledWith(false);
    });

    test('IDb.open', async () => {
        await db.open();
        expect(db.status).toBe(DbStatus.Opened);
    });
});
