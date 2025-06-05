export function errorIfNull(value: unknown, message: string): any
export function errorIfNull(value: any, message: string): asserts value is NonNullable<typeof value> {
    if (value === null || value === undefined) {
        BdApi.UI.alert("Error", message);
        throw new Error(message);
    }
    return value;
}

export function findInReactTree(root, filter) {
    return BdApi.Utils.findInTree(root, filter, {
        walkable: ["children", "props"]
    });
}