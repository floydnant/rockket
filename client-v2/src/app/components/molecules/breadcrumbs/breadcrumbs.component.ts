import { ChangeDetectionStrategy, Component, Input } from '@angular/core'
import { IconKey } from '../../atoms/icons/icon/icons'
import { MenuItem } from '../drop-down/drop-down.component'
import { BehaviorSubject, combineLatestWith, first, map } from 'rxjs'
import { moveToMacroQueue } from 'src/app/utils'
import { DeviceService } from 'src/app/services/device.service'

export interface Breadcrumb {
    title: string
    icon: IconKey
    route: string
    contextMenuItems?: MenuItem[]
}
type BreadcrumbInternal =
    | Breadcrumb
    | {
          truncated: Breadcrumb[]
      }

const isTruncationBreadcrumb = (breadcrumb: BreadcrumbInternal): breadcrumb is { truncated: Breadcrumb[] } =>
    'truncated' in breadcrumb

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
    constructor(private deviceService: DeviceService) {}

    @Input() set breadcrumbs(breadcrumbs: Breadcrumb[]) {
        this.breadcrumbs$_.next(breadcrumbs)
    }
    breadcrumbs$_ = new BehaviorSubject<Breadcrumb[]>([])
    breadcrumbsData$ = this.breadcrumbs$_.pipe(
        combineLatestWith(this.deviceService.isMobileScreen$),
        map(([breadcrumbs, isMobileScreen]): BreadcrumbInternal[] => {
            if (breadcrumbs.length > 4 && !isMobileScreen) {
                // @TODO: this functionality could be enhanced by adapting the number of breadcrumbs to the actual screen size
                // -> this setup is awkward for screens between 768px and 1150px
                const truncationBreadcrumb: BreadcrumbInternal = { truncated: breadcrumbs.slice(1, -3) }
                const crumbs = [breadcrumbs[0], truncationBreadcrumb, ...breadcrumbs.slice(-3)]

                return crumbs
            }

            if (breadcrumbs.length > 1 && isMobileScreen) {
                const truncationBreadcrumb: BreadcrumbInternal = { truncated: breadcrumbs.slice(0, -1) }
                const crumbs = [truncationBreadcrumb, breadcrumbs[breadcrumbs.length - 1]]

                return crumbs
            }

            return breadcrumbs
        })
    )

    trackByFn(_index: number, crumb: BreadcrumbInternal): string {
        if (isTruncationBreadcrumb(crumb)) {
            return 'truncated'
            // return crumb.truncated.map((c, i) => this.trackByFn(i, c)).join('')
        }

        const { icon, title, route } = crumb
        return icon + title + route
    }

    isTruncationBreadcrumb = isTruncationBreadcrumb

    isOverlayOpen$ = new BehaviorSubject(false)
    closeOverlayDelayed() {
        moveToMacroQueue(() => {
            this.isOverlayOpen$.next(false)
        })
    }
}
