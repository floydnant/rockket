import { ChangeDetectionStrategy, Component, Input } from '@angular/core'
import { IconKey } from '../../atoms/icons/icon/icons'
import { MenuItem } from '../drop-down/drop-down.component'

export interface Breadcrumb {
    title: string
    icon: IconKey
    route: string
    contextMenuItems?: MenuItem[]
}

@Component({
    selector: 'app-breadcrumbs',
    templateUrl: './breadcrumbs.component.html',
    styles: [
        `
            :host {
                @apply contents;
            }
        `,
    ],
    changeDetection: ChangeDetectionStrategy.OnPush,
})
export class BreadcrumbsComponent {
    @Input() breadcrumbs!: Breadcrumb[]
}
