import { Dialog } from '@angular/cdk/dialog'
import { Overlay, PositionStrategy } from '@angular/cdk/overlay'
import { Injectable, Type } from '@angular/core'
import { DialogComponent } from './dialog/dialog.component'
import { DialogDataInternal, DialogOptions, DialogType } from './types'

const VIEWPORT_MARGIN = 15

const defaultDialogSize = {
    minHeight: '200px',
    width: '500px',
}
const defaultConfirmButtons: NonNullable<DialogOptions['buttons']> = [{ text: 'Cancel' }, { text: 'Ok' }]
const defaultAlertButtons = [{ text: 'Ok' }]

export const constrainRectToViewport = (
    rect: { left: number; top: number; height: number; width: number },
    margin = VIEWPORT_MARGIN,
) => {
    let { left, top, height, width } = rect
    const right = left + width
    const bottom = top + height
    const availableWidth = window.innerWidth - margin
    const availableHeight = window.innerHeight - margin

    // Make sure the dialog is within the viewport
    if (right > availableWidth) left = Math.max(availableWidth - width, margin)
    if (bottom > availableHeight) top = Math.max(availableHeight - height, margin)

    // Make sure the dialog width and height are within the viewport
    if (width > availableWidth) width = availableWidth
    if (height > availableHeight) height = availableHeight

    return { left, top, height, width }
}

@Injectable({
    providedIn: 'root',
})
export class DialogService {
    constructor(private dialog: Dialog, private overlay: Overlay) {}

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

    showOverlay(
        component: Type<unknown>,
        elementOrGlobalPosition: { left: number; top: number; width?: number; height?: number },
        data?: unknown,
    ) {
        const closeOnOutsideClick = true

        const defaultWidth = 300
        const defaultHeight = 400
        const rect = constrainRectToViewport({
            width: defaultWidth,
            height: defaultHeight,
            ...elementOrGlobalPosition,
        })

        const dialogRef = this.dialog.open<string, unknown>(component, {
            // @TODO: support flexible positon strategy as well
            positionStrategy: this.getGlobalPositionStrategy(rect),
            hasBackdrop: false,
            restoreFocus: true,
            width: `${rect?.width || defaultWidth}px`,
            maxHeight: `${rect?.height || defaultHeight}px`,
            data,
        })
        if (closeOnOutsideClick) dialogRef.outsidePointerEvents.subscribe(() => dialogRef.close())

        return dialogRef
    }

    private getGlobalPositionStrategy(options: { left: number; top: number }): PositionStrategy {
        return this.overlay.position().global().left(`${options.left}px`).top(`${options.top}px`)
    }

    open = this.dialog.open.bind(this.dialog)
}
