function isIterable<T>(input: any): input is Iterable<T>{
    if (input === null || input === undefined) {
        return false
    }

    return typeof input[Symbol.iterator] === 'function';
}
