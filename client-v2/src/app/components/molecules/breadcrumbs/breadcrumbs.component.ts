import { ChangeDetectionStrategy, Component, Input } from '@angular/core'
import { isPageEntityIcon, PageEntityIconKey } from '../../atoms/icons/page-entity-icon/page-entity-icon.component'

export interface Breadcrumb {
    title: string
    icon: PageEntityIconKey | string
    route: string
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
