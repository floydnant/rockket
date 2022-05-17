export class DialogBaseOptions {
    title: string;
    buttons?: string[] = ['OK'];
    rejectOnButton?: string | string[] = [];
}
export class DialogConfirmOptions extends DialogBaseOptions {
    text?: string = '';
}
export class DialogPromptOptions extends DialogConfirmOptions {
    defaultValue?: string = '';
    placeholder?: string = '';
}
export class DialogFilterListOptions<Item extends object> extends DialogBaseOptions {
    list: Item[];
    /** key of the string property that is used for displaying the items */
    itemNameKey: keyof Item;
}

export type DialogFilterList_filterItem = {
    name: string;
    index: number;
    selected: boolean;
};

export class DialogComponentProps extends DialogPromptOptions {
    filterList?: DialogFilterList_filterItem[];
    type: 'confirm' | 'prompt' | 'filterArray';
}

export interface DialogResponseHandlerInterface {
    clickedButton: string;
    responseValue?: string;
    selectedItems?: DialogFilterList_filterItem[];
}

export type DialogResponse<T extends object = {}> = { clickedButton: string } & T;
export type DialogResponsePromise<T extends object = {}> = Promise<DialogResponse<T>>;

// export function arrayAsUnion<A extends readonly string[]>(arr: A): typeof arr[number] {
//     return arr[0];
// }
// export function arrayAsUnion_(array: string[]) {
//     const arr = array as const;
//     return arrayAsUnion(array);
// }

// const names = ['text', 'test'];
// const type = arrayAsUnion_(names);
// type Names = typeof names[number];
