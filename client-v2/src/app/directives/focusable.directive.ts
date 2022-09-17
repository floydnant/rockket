import { Directive, ElementRef, EventEmitter, Output } from '@angular/core'
import { moveToMacroQueue } from '../utils'

export class FocusableContext {
    constructor(public focusable: { focus: () => void; blur: () => void }) {}
}

@Directive({
    selector: '[focusable]',
    host: {
        '(focus)': 'emitFocusChange(true)',
        '(blur)': 'emitFocusChange(false)',
        '(keydown.Escape)': 'blur(); emitFocusChange(false)',
    },
    exportAs: 'focusable',
})
export class FocusableDirective {
    constructor(private elemRef: ElementRef<HTMLElement>) {}

    isFocused = false
    focus() {
        this.isFocused = true
        // add a delay in case the call originated from a mouse click
        moveToMacroQueue(() => this.elemRef.nativeElement.focus())
    }
    blur() {
        this.isFocused = false
        this.elemRef.nativeElement.blur()
    }

    @Output() focusChange = new EventEmitter<boolean>()
    private emitFocusChange(isHasFocus: boolean) {
        this.isFocused = isHasFocus
        this.focusChange.emit(isHasFocus)
    }
}
