import { AbstractCommand } from './abstract-command';
import { ICollection, IDbInsertResult } from '../../interfaces';

export interface IInsertCommandOptions {
    bypassDocumentValidation?: boolean; // TODO: implement it
    limit?: number;
}

export interface IInsertCommandResult<TSchema> extends IDbInsertResult<TSchema>{

}

export class InsertCommand<TSchema> extends AbstractCommand<IInsertCommandResult<TSchema>, TSchema> {
    readonly options: IInsertCommandOptions;
    readonly values: TSchema[];

    constructor(
        collection: ICollection<TSchema>,
        values: TSchema[],
        options: IInsertCommandOptions = {},
    ) {
        super(collection);

        if (values.length === 0) {
            throw new Error(`Inserted values can't be empty`);
        }

        this.values = values;
        this.options = options;
    }

    async execute(): Promise<IDbInsertResult<TSchema>> {
        const collection = this.collection;
        const {db} = collection;
        const {bypassDocumentValidation = true, limit} = this.options;
        const values = limit ? this.values.slice(0, limit) : this.values;

        if (!bypassDocumentValidation) {
            console.log('TODO: implement it using db', db);
        }

        // TODO: implement response verification
        return collection.db.insert<TSchema>(values, {collection});
    }

}

export interface IInsertOneCommandOptions {
    bypassDocumentValidation?: boolean;
}

export interface IInsertOneCommandResult<TSchema> extends IInsertCommandResult<TSchema>{

}

export class InsertOneCommand<TSchema> extends InsertCommand<TSchema> {
    readonly value: TSchema;

    constructor(
        collection: ICollection<TSchema>,
        value: TSchema,
        options: IInsertOneCommandOptions = {},
    ) {
        super(collection, [value], {...options, limit: 1});
        this.value = value;
    }
}
