import { AfterViewInit, Directive, ElementRef, EventEmitter, Input, Output } from '@angular/core'
import { moveToMacroQueue } from '../utils'

export class FocusableContext {
    constructor(public focusable: { focus: () => void; blur: () => void }) {}
}

export const canSelect = <T extends HTMLElement>(elem: T): elem is T & { select(): void } => {
    return 'select' in elem && typeof (elem as unknown as HTMLInputElement).select == 'function'
}

@Directive({
    // @TODO: rename to blurrable and remove the focusable selector
    selector: '[appBlurrable], [focusable]',
    host: {
        '(focus)': 'emitFocusChange(true)',
        '(blur)': 'emitFocusChange(false)',
        '(keydown.Escape)': 'blur(); emitFocusChange(false)',
    },
    exportAs: 'focusable',
})
export class FocusableDirective implements AfterViewInit {
    constructor(private elemRef: ElementRef<HTMLElement>) {}

    ngAfterViewInit() {
        if (this.autoFocus) this.focus()
        else if (this.autoSelect) this.focus(true)
    }

    @Input() autoFocus = false
    @Input() autoSelect = false

    isFocused = false
    focus(select = false) {
        this.isFocused = true
        // add a delay in case the call originated from a mouse click
        moveToMacroQueue(() => {
            const elem = this.elemRef.nativeElement

            if (select && canSelect(elem)) elem.select()
            else elem.focus()
        })
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
