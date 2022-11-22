export const assertDefined = <T>(obj: T | null | undefined): T => {
    expect(obj).toBeDefined();
    return obj as T;
}
