import { ChangeDetectionStrategy, Component, Input } from '@angular/core'
import { IconKey } from '../icons/icon/icons'

@Component({
    selector: 'app-entity-page-label',
    template: `
        <span class="inline-flex justify-center">
            <app-icon class="icon | mr-1 inline-block w-4 text-md" [icon]="pageIcon"></app-icon>
        </span>
        <span class="title | truncate">{{ pageTitle }}</span>
    `,
    styles: [
        `
            :host {
                @apply truncate;
            }
        `,
    ],
    changeDetection: ChangeDetectionStrategy.OnPush,
})
export class EntityPageLabelComponent {
    @Input() pageTitle!: string
    @Input() pageIcon!: IconKey | string
}
