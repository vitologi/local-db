export class IdbAsyncIterator<TSchema> implements AsyncIterable<TSchema> {
    // private _request: Promise<IDBRequest<IDBCursorWithValue | null>>;
    // private _indexes: string[];
    // private _listeners: Array<(err: Error, value?: any) => void>;
    // private _cursor: IDBCursorWithValue | null;
    private listeners: Array<(value: IDBCursorWithValue | null) => void> = [];

    // private _cursor: Promise<>;


    constructor(store: Promise<IDBObjectStore>, indexes: string[]) {
        // this._indexes = indexes;
        // this._request =
            store
            .then((store) => {
                const request = indexes.length
                    ? store.index(indexes[0]).openCursor()
                    : store.openCursor();
                // const listeners = this._listeners;
                const listeners = this.listeners;

                request.onsuccess = function () {
                    const cursor = this.result;
                    listeners.forEach((cb) => cb(cursor));
                    // if (cursor) {
                    //
                    // }
                    // listeners[0](cursor ? cursor.value : null);
                };
                request.onerror = function () {
                    throw new Error('Cant get next cursor value');
                }
                // return request;
            });

        // const cursor = indexes.length ?
    }

    async getCursor(): Promise<IDBCursorWithValue | null> {
        // if (this._cursor) {
        //     return this._cursor;
        // }

        return new Promise<IDBCursorWithValue | null>((resolve => {
            const listener = (cursor: IDBCursorWithValue | null) => {
                resolve(cursor);
                this.listeners.splice(this.listeners.indexOf(listener), 1);
            };
            this.listeners.push(listener);
        }))
    }

    [Symbol.asyncIterator]() {
        return {
            next: async () => {
                const cursor = await this.getCursor();

                if (cursor) {
                    return {done: false, value: cursor.value as TSchema};
                } else {
                    return {done: true, value: null} as IteratorReturnResult<null>;
                }

                // return new Promise((resolve, reject) => {
                //     const listener = (value: any, error: Error) => {
                //         resolve(value ? {done: false, value: value} : {done: true, value: null});
                //         this._listeners.splice(this._listeners.indexOf(listener), 1);
                //     }
                //     this._listeners.push(listener);
                //     cursor.continue();
                // })
            }
        }
    }
}
