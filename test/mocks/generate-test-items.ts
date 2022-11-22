import { ITestItem } from "./test-item.interface";

export const generateTestItems = (length:number): ITestItem[] => Array
    .from({length}, (_, i) => ({
        _id: Math.random().toString(),
        title: `Item №${i}`,
    }));
