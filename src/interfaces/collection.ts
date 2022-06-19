import { ICollectionOptions } from './options/collection-options';
import { IDb } from './db';
import { Filter, UpdateFilter } from '../types/mongo-types';
import { IFindCommandOptions } from '../models/commands/find-command';
import { IInsertOneCommandOptions, IInsertOneCommandResult } from "../models/commands/insert-command";
import { IDeleteOneCommandOptions, IDeleteOneCommandResult } from "../models/commands/delete-command";
import { IUpdateOneCommandOptions, IUpdateOneCommandResult } from "../models/commands/update-command";

export const kOptions = Symbol('options');

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export interface ICollection<TSchema> {
    [kOptions]: ICollectionOptions;

    options: Readonly<ICollectionOptions>;

    db: IDb;

    name: string;

    find(filter: Filter<TSchema>, options?: IFindCommandOptions): Promise<TSchema[]>;

    findOne(filter: Filter<TSchema>, options?: IFindCommandOptions): Promise<TSchema | null>;

    insertOne(data: TSchema, options?: IInsertOneCommandOptions): Promise<IInsertOneCommandResult<TSchema>>;

    deleteOne(filter: Filter<TSchema>, options?: IDeleteOneCommandOptions): Promise<IDeleteOneCommandResult>;

    updateOne(filter: Filter<TSchema>, update: UpdateFilter<TSchema>, options: IUpdateOneCommandOptions): Promise<IUpdateOneCommandResult<TSchema>>;


    // TODO: implement logging

    // TODO: implement bellow methods
    // watch<TLocal extends Document = TSchema, TChange extends Document = ChangeStreamDocument<TLocal>>(
    //     pipeline: Document[] = [],
    //     options: ChangeStreamOptions = {}
    // ): ChangeStream<TLocal, TChange>

    // aggregate<T extends Document = Document>(
    //     pipeline: Document[] = [],
    //     options?: AggregateOptions
    //   ): AggregationCursor<T>

    // insertMany(
    //     docs: OptionalUnlessRequiredId<TSchema>[],
    //     options?: BulkWriteOptions | Callback<InsertManyResult<TSchema>>,
    //     callback?: Callback<InsertManyResult<TSchema>>
    //   ): Promise<InsertManyResult<TSchema>> | void;

    // bulkWrite(
    //     operations: AnyBulkWriteOperation<TSchema>[],
    //     options?: BulkWriteOptions | Callback<BulkWriteResult>,
    //     callback?: Callback<BulkWriteResult>
    // ): Promise<BulkWriteResult> | void;

    // replaceOne(
    //     filter: Filter<TSchema>,
    //     replacement: WithoutId<TSchema>,
    //     options?: ReplaceOptions | Callback<UpdateResult | Document>,
    //     callback?: Callback<UpdateResult | Document>
    // ): Promise<UpdateResult | Document> | void;
    //
    // updateMany(
    //     filter: Filter<TSchema>,
    //     update: UpdateFilter<TSchema>,
    //     options?: UpdateOptions | Callback<UpdateResult | Document>,
    //     callback?: Callback<UpdateResult | Document>
    // ): Promise<UpdateResult | Document> | void;
    //
    //
    // deleteMany(
    //     filter: Filter<TSchema>,
    //     options?: DeleteOptions | Callback<DeleteResult>,
    //     callback?: Callback<DeleteResult>
    // ): Promise<DeleteResult> | void;
    //
    // findOneAndDelete(
    //     filter: Filter<TSchema>,
    //     options?: FindOneAndDeleteOptions | Callback<ModifyResult<TSchema>>,
    //     callback?: Callback<ModifyResult<TSchema>>
    // ): Promise<Document> | void;

    // findOneAndReplace(
    //     filter: Filter<TSchema>,
    //     replacement: WithoutId<TSchema>,
    //     options?: FindOneAndReplaceOptions | Callback<ModifyResult<TSchema>>,
    //     callback?: Callback<ModifyResult<TSchema>>
    // ): Promise<ModifyResult<TSchema>> | void
    //
    // findOneAndUpdate(
    //     filter: Filter<TSchema>,
    //     update: UpdateFilter<TSchema>,
    //     options?: FindOneAndUpdateOptions | Callback<ModifyResult<TSchema>>,
    //     callback?: Callback<ModifyResult<TSchema>>
    // ): Promise<ModifyResult<TSchema>> | void



    // TODO: db operations
    // rename(
    //     newName: string,
    //     options?: RenameOptions | Callback<Collection>,
    //     callback?: Callback<Collection>
    // ): Promise<Collection> | void;
    //
    //
    // drop(
    //     options?: DropCollectionOptions | Callback<boolean>,
    //     callback?: Callback<boolean>
    // ): Promise<boolean> | void;
    //
    // isCapped(
    //     options?: OperationOptions | Callback<boolean>,
    //     callback?: Callback<boolean>
    // ): Promise<boolean> | void;
    //
    // createIndex(
    //     indexSpec: IndexSpecification,
    //     options?: CreateIndexesOptions | Callback<string>,
    //     callback?: Callback<string>
    // ): Promise<string> | void;
    //
    // createIndexes(
    //     indexSpecs: IndexDescription[],
    //     options?: CreateIndexesOptions | Callback<string[]>,
    //     callback?: Callback<string[]>
    // ): Promise<string[]> | void;
    //
    // dropIndex(
    //     indexName: string,
    //     options?: DropIndexesOptions | Callback<Document>,
    //     callback?: Callback<Document>
    // ): Promise<Document> | void;
    //
    // dropIndexes(
    //     options?: DropIndexesOptions | Callback<Document>,
    //     callback?: Callback<Document>
    // ): Promise<Document> | void;
    //
    // listIndexes(options?: ListIndexesOptions): ListIndexesCursor;
    //
    // indexExists(
    //     indexes: string | string[],
    //     options?: IndexInformationOptions | Callback<boolean>,
    //     callback?: Callback<boolean>
    // ): Promise<boolean> | void;
    //
    // indexInformation(
    //     options?: IndexInformationOptions | Callback<Document>,
    //     callback?: Callback<Document>
    // ): Promise<Document> | void;
}

