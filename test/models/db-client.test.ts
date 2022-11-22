import { IndexedDbProvider, Db, DbStatus, DbClient, IDb, IDbClient, IDbMigration } from "../../src";
import { ITestItem } from '../mocks/test-item.interface';
import { generateMigration } from "../mocks/generate-migration";

describe('DbClient', () => {

    const migrations: Array<IDbMigration> = [
        generateMigration('FirstCollection'),
        generateMigration('SecondCollection'),
    ];

    let dbClient: IDbClient;
    let db: IDb;
    beforeAll(async () => {
        dbClient = new DbClient({dbName: 'TestDb', provider: IndexedDbProvider})
        db = new Db('TestDb', {migrations, client: dbClient});
        await db.open();
    });

    test('Create database', async () => {
        expect(db.status).toBe(DbStatus.Opened);
    });

    test('Collection created', async () => {
        let isCollectionCreated = await db.hasCollection('FirstCollection');
        expect(isCollectionCreated).toBe(true);
        isCollectionCreated = await db.hasCollection('SecondCollection');
        expect(isCollectionCreated).toBe(true);
        expect(true).toBe(true);
    });

    test('Insert items', async () => {
        let items: ITestItem[];
        const collection = db.collection<ITestItem>('FirstCollection');
        await collection.insertOne({_id: '1', title: 'first row'});
        await collection.insertOne({_id: '2', title: 'second row'});
        items = await collection.find({});
        expect(items).toHaveLength(2);
        expect(items[0].title).toBe('first row');
        expect(items[1].title).toBe('second row');
    });

    test('Delete items', async () => {
        let items: ITestItem[];
        const collection = db.collection<ITestItem>('FirstCollection');

        await collection.insertOne({_id: '3', title: 'third row'});
        await collection.insertOne({_id: '4', title: 'forth row'});

        items = await collection.find({_id: {$in: ['3', '4']}});
        expect(items).toHaveLength(2);
        expect(items[0].title).toBe('third row');
        expect(items[1].title).toBe('forth row');

        const resultOne = await collection.deleteOne({_id: '3'});
        const resultSecond = await collection.deleteOne({_id: '4'});

        expect(resultOne.deletedCount).toBe(1);
        expect(resultSecond.deletedCount).toBe(1);
        items = await collection.find({_id: {$in: ['3', '4']}});
        expect(items).toHaveLength(0);
    });
});
