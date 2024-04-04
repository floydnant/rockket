import { Directive, ElementRef, EventEmitter, Input, OnDestroy, Output } from '@angular/core'

interface MutationOptions {
    plainOnly?: boolean
    observe?: boolean
}

@Directive({
    selector: '[appMutation], [domChanges], [textChanges]',
})
export class MutationDirective implements OnDestroy {
    constructor(private elementRef: ElementRef<HTMLElement>) {}

    ngOnDestroy(): void {
        this.observer.disconnect()
    }

    @Output() domChanges = new EventEmitter<MutationRecord>()
    @Output() textChanges = new EventEmitter<string>()

    @Input('mutationOptions') set setMutationOptions(options: MutationOptions) {
        this.mutationOptions = options

        if (!options.observe) {
            this.observer.disconnect()
            return
        }

        this.observer.observe(this.elementRef.nativeElement, {
            attributes: false,
            childList: true,
            subtree: true,
            characterData: true,
        })
    }
    private mutationOptions: MutationOptions = {
        plainOnly: false,
        observe: true,
    }

    private observer = new MutationObserver(mutations => {
        mutations.forEach(mutation => {
            const element = this.elementRef.nativeElement
            const trimmedText = element.innerText.trim()

            if (this.mutationOptions.plainOnly && element.childNodes.length > 1) {
                element.innerHTML = trimmedText

                try {
                    window.getSelection()?.setPosition(element, 1) // Restore cursor position
                } catch (err) {
                    console.log('Error restoring cursor position', err)
                }
                return
            }

            this.domChanges.emit(mutation)

            if (this.mutationOptions.plainOnly) {
                this.textChanges.emit(trimmedText)
                return
            }

            this.textChanges.emit(trimmedText ? element.innerHTML.trim() : '')
        })
    })
}
