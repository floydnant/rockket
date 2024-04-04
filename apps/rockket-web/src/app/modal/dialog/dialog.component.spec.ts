import { DialogRef, DIALOG_DATA } from '@angular/cdk/dialog'
import { ComponentFixture, TestBed } from '@angular/core/testing'
import { DialogDataInternal, DialogType } from '../types'

import { DialogComponent } from './dialog.component'

const confirmDialogData: DialogDataInternal = {
    title: 'Dialog Title',
    text: 'Dialog Text content',
    buttons: [{ text: 'Cancel' }, { text: 'OK' }],
    type: DialogType.CONFIRM,
}

describe('DialogComponent', () => {
    let component: DialogComponent
    let fixture: ComponentFixture<DialogComponent>

    beforeEach(async () => {
        await TestBed.configureTestingModule({
            declarations: [DialogComponent],
            providers: [
                // eslint-disable-next-line @typescript-eslint/no-empty-function
                { provide: DialogRef, useValue: { close() {} } },
                {
                    provide: DIALOG_DATA,
                    useValue: confirmDialogData,
                },
            ],
        }).compileComponents()

        fixture = TestBed.createComponent(DialogComponent)
        component = fixture.componentInstance
        fixture.detectChanges()
    })

    it('should create', () => {
        expect(component).toBeTruthy()
    })
})
