class CustomDialogBaseOptions {
    title: string;
    buttons?: string[] = ['OK'];
}
export class CustomDialogConfirmOptions extends CustomDialogBaseOptions {
    text?: string = '';
}
export class CustomDialogPromptOptions extends CustomDialogConfirmOptions {
    defaultValue?: string = '';
    placeholder?: string = '';
}
export class CustomDialogFilterArrayOptions<Item extends object> extends CustomDialogBaseOptions {
    array: Item[];
    /**
     * key of the string property that is used for displaying the items
     */
    itemKey: string;
}

export type CustomDialogFilterArray_filterItem = {
    name: string;
    index: number;
    selected: boolean;
};

export class CustomDialogComponentProps extends CustomDialogPromptOptions {
    filterArray?: CustomDialogFilterArray_filterItem[];
    type: 'confirm' | 'prompt' | 'filterArray';
}

export interface responseHandlerInterface {
    buttons: string[];
    resBtnIndex: number;
    promptInput?: string;
    filterdArray?: CustomDialogFilterArray_filterItem[];
}
