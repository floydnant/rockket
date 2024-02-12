import { DialogConfig, DialogRef } from '@angular/cdk/dialog'

export enum DialogType {
    CONFIRM = 'confirm',
    ALERT = 'alert',
}

export interface DialogData {
    title: string
    text?: string
    buttons?: {
        text: string
        className?: string
        resCode?: string
    }[]
}

export interface DialogDataInternal extends DialogData {
    type: DialogType
}

export interface DialogOptions extends DialogData {
    config?: Omit<DialogConfig<DialogDataInternal, DialogRef<string, unknown>>, 'data'>
}
