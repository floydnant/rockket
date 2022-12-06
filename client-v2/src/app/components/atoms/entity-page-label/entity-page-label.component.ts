import { Component, Input } from '@angular/core'
import { PageEntityIconKey } from '../icons/page-entity-icon/page-entity-icon.component'

@Component({
    selector: 'app-entity-page-label',
    template: `
        <span class="inline-flex justify-center">
            <page-entity-icon class="icon | mr-1 inline-block w-4 text-md" [icon]="pageIcon"></page-entity-icon>
        </span>
        <span class="title | truncate">{{ title }}</span>
    `,
    styles: [
        `
            :host {
                @apply truncate;
            }
        `,
    ],
})
export class EntityPageLabelComponent {
    @Input() title!: string
    @Input() pageIcon!: PageEntityIconKey
}
