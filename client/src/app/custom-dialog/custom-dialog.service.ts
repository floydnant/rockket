import { Injectable } from '@angular/core';
import { Task } from '../shared/task.model';
import { CustomDialogComponent } from './custom-dialog.component';
import {
    CustomDialogConfirmOptions,
    CustomDialogFilterArray_filterItem,
    CustomDialogFilterArrayOptions,
    CustomDialogPromptOptions,
    responseHandlerInterface,
} from './custom-dialog.model';

@Injectable({
    providedIn: 'root',
})
export class DialogService {
    dialog: CustomDialogComponent;
    responseHandler: (response: responseHandlerInterface) => void;

    confirm(options: CustomDialogConfirmOptions): Promise<string> {
        const defaultOptions = new CustomDialogConfirmOptions();
        return new Promise((resolve, reject) => {
            this.dialog.open({
                ...defaultOptions,
                ...options,
                type: 'confirm',
            });

            this.responseHandler = ({ buttons, resBtnIndex }) => {
                if (resBtnIndex == buttons.length - 1) resolve(buttons[resBtnIndex]);
                else reject(buttons[resBtnIndex]);
            };
        });
    }
    prompt(options: CustomDialogPromptOptions): Promise<string> {
        const defaultOptions = new CustomDialogPromptOptions();
        return new Promise((resolve, reject) => {
            this.dialog.open({
                ...defaultOptions,
                ...options,
                type: 'prompt',
            });

            this.responseHandler = ({ promptInput, buttons, resBtnIndex }) => {
                if (promptInput.trim() && resBtnIndex == buttons.length - 1) resolve(promptInput);
                else reject(buttons[resBtnIndex]);
            };
        });
    }
    filterArray<T extends object>({ array, itemKey, ...options }: CustomDialogFilterArrayOptions<T>): Promise<T[]> {
        const defaultOptions = new CustomDialogFilterArrayOptions();
        return new Promise((resolve, reject) => {
            this.dialog.open({
                ...defaultOptions,
                ...options,
                filterArray: array.map<CustomDialogFilterArray_filterItem>((item, i) => ({
                    name: item[itemKey],
                    index: i,
                    selected: false,
                })),
                type: 'filterArray',
            });

            this.responseHandler = ({ buttons, resBtnIndex, filterdArray }) => {
                if (resBtnIndex == buttons.length - 1)
                    resolve(
                        filterdArray
                            .filter(filterItem => filterItem.selected)
                            .map(filterItem => array[filterItem.index])
                    );
                else reject(buttons[resBtnIndex]);
            };
        });
    }
}

async () => {
    const arr = await new DialogService().filterArray({ title: 'test', array: [new Task()], itemKey: 'name' });
};
