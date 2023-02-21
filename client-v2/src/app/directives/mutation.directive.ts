import { Directive, ElementRef, EventEmitter, Input, OnChanges, OnDestroy, Output, SimpleChanges } from '@angular/core'

@Directive({
    selector: '[domChanges], [textChanges]',
})
export class MutationDirective implements OnDestroy, OnChanges {
    constructor(private elementRef: ElementRef<HTMLElement>) {
        const element = this.elementRef.nativeElement

        this.observer = new MutationObserver(mutations => {
            mutations.forEach(mutation => {
                if (this.mutationOptions.plainOnly && element.childNodes.length > 1) {
                    element.innerHTML = element.innerText.trim()

                    try {
                        window.getSelection()?.setPosition(element, 1) // restore cursor position
                    } catch (err) {
                        console.log('Error restoring cursor position', err)
                    }
                    return
                }

                this.domChanges.emit(mutation)
                if (this.mutationOptions.plainOnly) this.textChanges.emit(element.innerText.trim())
                else this.textChanges.emit(element.innerText.trim() ? element.innerHTML.trim() : '')
            })
        })
    }

    ngOnChanges(changes: SimpleChanges): void {
        if ('mutationOptions' in changes)
            if (!this.mutationOptions.observe) this.observer.disconnect()
            else {
                this.observer.observe(this.elementRef.nativeElement, {
                    attributes: false,
                    childList: true,
                    subtree: true,
                    characterData: true,
                })
            }
    }
    ngOnDestroy(): void {
        this.observer.disconnect()
    }

    private observer: MutationObserver

    @Output() domChanges = new EventEmitter<MutationRecord>()
    @Output() textChanges = new EventEmitter<string>()

    @Input() mutationOptions: {
        plainOnly?: boolean
        observe?: boolean
    } = {
        plainOnly: false,
        observe: true,
    }
}
