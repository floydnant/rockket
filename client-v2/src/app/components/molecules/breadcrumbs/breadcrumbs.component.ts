import { ChangeDetectionStrategy, Component, Input } from '@angular/core'
import { isPageEntityIcon, PageEntityIconKey } from '../../atoms/icons/page-entity-icon/page-entity-icon.component'
import { MenuItem } from '../drop-down/drop-down.component'

export interface Breadcrumb {
    title: string
    icon: PageEntityIconKey | string
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

    isPageEntityIcon = isPageEntityIcon
}
