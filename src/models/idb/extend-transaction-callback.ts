type TCbProp = 'onabort' | 'oncomplete' | 'onerror';

export function extendTransactionCallback(transaction: IDBTransaction, prop: TCbProp, cb: (this:IDBTransaction, ev: Event) => any){
    const oldCb = transaction[prop];

    if(oldCb === null){
        transaction[prop] = cb;
        return;
    }

    transaction[prop] = function (...args){
        oldCb.apply(this, args);
        cb.apply(this, args);
    }
}
