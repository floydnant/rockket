import { Injectable } from '@angular/core';
import { Task } from '../shared/task.model';
import { CustomDialogComponent } from '../components/organisms/dialog/dialog.component';
import {
    DialogBaseOptions,
    DialogConfirmOptions,
    DialogFilterListOptions,
    DialogPromptOptions,
    DialogResponse,
    DialogResponseHandlerInterface,
    DialogResponsePromise,
} from '../components/organisms/dialog/dialog.model';

@Injectable({
    providedIn: 'root',
})
export class DialogService {
    dialog: CustomDialogComponent;

    responseHandler: (response: DialogResponseHandlerInterface) => void;
    private setResponseHandler<T extends object>({
        resolve,
        reject,
        rejectOnButton,
        transformer,
    }: {
        resolve: (res: T) => void;
        reject: (res: any) => void;
        rejectOnButton: DialogBaseOptions['rejectOnButton'];
        transformer?: (res: DialogResponseHandlerInterface) => T;
    }) {
        this.responseHandler = res => {
            let response: T;
            if (transformer) response = { clickedButton: res.clickedButton, ...transformer(res) };
            else response = res as T;

            if (!rejectOnButton?.length) {
                resolve(response);
                return;
            }

            if (typeof rejectOnButton == 'string') rejectOnButton = [rejectOnButton];
            if (rejectOnButton.some(btn => btn == (response as DialogResponse).clickedButton)) reject(response);
        };
    }

    confirm(options: DialogConfirmOptions): DialogResponsePromise {
        const defaultOptions = new DialogConfirmOptions();
        return new Promise((resolve, reject) => {
            this.dialog.open({
                ...defaultOptions,
                ...options,
                type: 'confirm',
            });

            // this.responseHandler = ({ clickedButton }) => resolve({ clickedButton });
            this.setResponseHandler({
                resolve,
                reject,
                rejectOnButton: options.rejectOnButton,
            });
        });
    }

    prompt(options: DialogPromptOptions): DialogResponsePromise<{ responseValue: string }> {
        const defaultOptions = new DialogPromptOptions();
        return new Promise((resolve, reject) => {
            this.dialog.open({
                ...defaultOptions,
                ...options,
                type: 'prompt',
            });

            this.setResponseHandler({
                resolve,
                reject,
                rejectOnButton: options.rejectOnButton,
                transformer: ({ clickedButton, responseValue }) => ({ clickedButton, responseValue }),
            });
        });
    }

    filterList<T extends object>({
        list,
        itemNameKey,
        rejectOnButton,
        ...options
    }: DialogFilterListOptions<T>): DialogResponsePromise<{ filteredList: T[] }> {
        const defaultOptions = new DialogFilterListOptions();
        return new Promise((resolve, reject) => {
            this.dialog.open({
                ...defaultOptions,
                ...options,
                filterList: list.map((item, i) => ({
                    name: item[itemNameKey] as unknown as string,
                    index: i,
                    selected: false,
                })),
                type: 'filterArray',
            });

            this.setResponseHandler({
                resolve,
                reject,
                rejectOnButton,
                transformer: ({ clickedButton, selectedItems }) => ({
                    clickedButton,
                    filteredList: selectedItems
                        .filter(filterItem => filterItem.selected)
                        .map(filterItem => list[filterItem.index]),
                }),
            });
        });
    }
}

async () => {
    const { filteredList, clickedButton } = await new DialogService().filterList({
        title: 'test',
        list: [new Task()],
        itemNameKey: 'name',
        buttons: ['Cancel', 'OK'],
        rejectOnButton: 'Cancel',
    });
};
