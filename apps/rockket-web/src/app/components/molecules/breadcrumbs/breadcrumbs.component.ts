import { ChangeDetectionStrategy, Component, Input } from '@angular/core'
import { IconKey } from '../../atoms/icons/icon/icons'
import { MenuItem } from '../../../dropdown/drop-down/drop-down.component'
import { BehaviorSubject, combineLatestWith, distinctUntilChanged, map, timer } from 'rxjs'
import { moveToMacroQueue } from 'src/app/utils'
import { DeviceService } from 'src/app/services/device.service'
import { MenuService } from '../../templates/sidebar-layout/menu.service'
import { coalesceWith } from '@rx-angular/cdk/coalescing'

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

// @TODO: this is just eyeballed and could easily be more accurate
const getWidthFromText = (text: string) => {
    const length = text.length > 20 ? 23 : text.length
    const widthPerChar = 6

    const iconWidth = 15
    const extraContainerWidth = 13
    const extraWidth = 25 + iconWidth + extraContainerWidth

    return widthPerChar * length + extraWidth
}
const truncateBreadcrumbs = (breadcrumbs: Breadcrumb[], truncate: number): BreadcrumbInternal[] => {
    if (truncate < 1) return breadcrumbs

    const includeFirstItem = breadcrumbs.length - truncate > 1 ? 1 : 0
    const rightHandCount = breadcrumbs.length - truncate - includeFirstItem

    const truncationBreadcrumb: BreadcrumbInternal = {
        truncated: breadcrumbs.slice(includeFirstItem, rightHandCount * -1),
    }
    const crumbs = includeFirstItem
        ? [breadcrumbs[0], truncationBreadcrumb, ...breadcrumbs.slice(rightHandCount * -1)]
        : [truncationBreadcrumb, ...breadcrumbs.slice(rightHandCount * -1)]
    return crumbs
}

const range = (start: number, end: number) => {
    const length = end - start + 1
    return new Array(length).fill(null).map((_, index) => start + index)
}
// Const range_ = (startOrLength: number, end?: number) => {
//     const length = !end ? startOrLength : end - startOrLength + 1
//     const offset = end ? startOrLength : 0
//     return new Array(length).fill(null).map((_, index) => offset + index)
// }

const getTruncatedBreadcrumbIndicies = (breadcrumbs: unknown[], truncate: number): number[] => {
    if (truncate < 1) return breadcrumbs.map((_, i) => i)

    const includeFirstItem = breadcrumbs.length - truncate > 1 ? 1 : 0
    const rightHandCount = breadcrumbs.length - truncate - includeFirstItem

    const crumbs = includeFirstItem
        ? [0, ...range(breadcrumbs.length - rightHandCount, breadcrumbs.length - 1)]
        : [breadcrumbs.length - 1]
    return crumbs
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
    constructor(private deviceService: DeviceService, private menuService: MenuService) {}

    availableWidth$ = this.deviceService.screenWidth$.pipe(
        combineLatestWith(this.menuService.sidebarWidth$, this.deviceService.isMobileScreen$),
        coalesceWith(timer(100)),
        map(([screenWidth, sidebarWidth, isMobileScreen]) => {
            return (isMobileScreen ? screenWidth : screenWidth - sidebarWidth) - 170 // Extra space
        }),
    )

    @Input() set breadcrumbs(breadcrumbs: Breadcrumb[]) {
        this.breadcrumbs$_.next(breadcrumbs)
    }
    breadcrumbs$_ = new BehaviorSubject<Breadcrumb[]>([])
    breadcrumbs$ = this.breadcrumbs$_.pipe(
        combineLatestWith(this.availableWidth$),
        map(([breadcrumbs, availableWidth]): BreadcrumbInternal[] => {
            if (breadcrumbs.length == 1) return breadcrumbs

            // @TODO: maybe we could have a setting that controls the max number of breadcrumbs to show

            const doesFit = (widths: number[], extraWidth = 0) =>
                widths.reduce((a, b) => a + b, extraWidth) <= availableWidth

            const widths = breadcrumbs.map(breadcrumb => getWidthFromText(breadcrumb.title))
            if (doesFit(widths)) return breadcrumbs

            const mapToWidth = (index: number) => widths[index]

            // @TODO: @POTENTIALLY_UNPERFORMANT
            let truncate = 1
            let proposedWidths = getTruncatedBreadcrumbIndicies(breadcrumbs, truncate).map(mapToWidth)
            while (!doesFit(proposedWidths, 40) && truncate < breadcrumbs.length - 1) {
                truncate++
                proposedWidths = getTruncatedBreadcrumbIndicies(breadcrumbs, truncate).map(mapToWidth)
            }

            return truncateBreadcrumbs(breadcrumbs, truncate)
        }),
        distinctUntilChanged((a, b) => JSON.stringify(a) == JSON.stringify(b)),
    )

    trackByFn(_index: number, crumb: BreadcrumbInternal): string {
        if (isTruncationBreadcrumb(crumb)) {
            return 'truncated'
            // Return crumb.truncated.map((c, i) => this.trackByFn(i, c)).join('')
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
