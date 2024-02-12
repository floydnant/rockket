import { Component, Inject } from '@angular/core'
import { DialogRef, DIALOG_DATA } from '@angular/cdk/dialog'
import { DialogDataInternal, DialogType } from '../types'

@Component({
    templateUrl: './dialog.component.html',
    host: {
        'data-test-name': 'modal-dialog',
    },
})
export class DialogComponent {
    constructor(public dialogRef: DialogRef, @Inject(DIALOG_DATA) public data: DialogDataInternal) {}

    DialogType = DialogType
}
