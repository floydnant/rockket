import { Injectable } from '@angular/core'
import { Dialog } from '@angular/cdk/dialog'
import { DialogComponent } from './dialog/dialog.component'
import { DialogDataInternal, DialogOptions, DialogType } from './types'

const defaultDialogSize = {
    minHeight: '200px',
    width: '500px',
}
const defaultConfirmButtons: NonNullable<DialogOptions['buttons']> = [{ text: 'Cancel' }, { text: 'Ok' }]
const defaultAlertButtons = [defaultConfirmButtons[1]]

@Injectable({
    providedIn: 'root',
})
export class DialogService {
    constructor(private dialog: Dialog) {}

    confirm({ config, buttons, ...options }: DialogOptions) {
        return this.dialog.open<string, DialogDataInternal>(DialogComponent, {
            ...defaultDialogSize,
            data: {
                ...options,
                buttons: buttons || defaultConfirmButtons,
                type: DialogType.CONFIRM,
            },
            ...(config || {}),
        })
    }

    alert({ config, ...options }: Omit<DialogOptions, 'buttons'>) {
        return this.dialog.open<string, DialogDataInternal>(DialogComponent, {
            ...defaultDialogSize,
            data: {
                ...options,
                buttons: defaultAlertButtons,
                type: DialogType.ALERT,
            },
            ...(config || {}),
        })
    }

    open = this.dialog.open.bind(this.dialog)
}
