import { Component, EventEmitter, Input, Output } from '@angular/core'

@Component({
    selector: 'app-modal',
    templateUrl: './modal.component.html',
    host: {
        'data-test-name': 'modal',
    },
    styles: [
        `
            :host {
                @apply flex h-full flex-col justify-start rounded-xl border border-tinted-700 bg-tinted-800 shadow-header !backdrop-blur-sm glass;
            }
        `,
    ],
})
export class ModalComponent {
    @Input() enableHeader = false
    @Input() enableCloseButton = true
    @Input() enableFooter = true

    @Output() close = new EventEmitter()
}
