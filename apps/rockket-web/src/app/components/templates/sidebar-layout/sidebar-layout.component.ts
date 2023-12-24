import { AfterViewInit, Component, ElementRef, Input, ViewChild } from '@angular/core'
import { UntilDestroy, untilDestroyed } from '@ngneat/until-destroy'
import { animationFrames, debounceTime, distinctUntilChanged, fromEvent, map, switchMap, takeUntil, tap } from 'rxjs'
import { DeviceService } from 'src/app/services/device.service'
import { UiStateService } from 'src/app/services/ui-state.service'
import { MenuService } from './menu.service'
import { coalesceWith } from '@rx-angular/cdk/coalescing'

@UntilDestroy()
@Component({
    selector: 'app-sidebar-layout',
    templateUrl: './sidebar-layout.component.html',
    styleUrls: ['./sidebar-layout.component.css'],
})
export class SidebarLayoutComponent implements AfterViewInit {
    constructor(
        private menuService: MenuService,
        private deviceService: DeviceService,
        private uiStateService: UiStateService
    ) {}

    @Input() enableResize = true

    isMobileScreen$ = this.deviceService.isMobileScreen$

    isMenuOpen$ = this.menuService.isMenuOpen$
    isBottomNavBorderVisible$ = this.menuService.isBottomNavBorderVisible$

    isSidebarScrolled = false
    setScrollSpyIntersecting(isIntersecting: boolean) {
        this.isSidebarScrolled = !isIntersecting
    }

    uiState = this.uiStateService.sidebarUiState

    @ViewChild('resizeHandle') resizeHandle!: ElementRef<HTMLDivElement>
    @ViewChild('sidebar') sidebar!: ElementRef<HTMLDivElement>

    ngAfterViewInit(): void {
        const sidebar = this.sidebar.nativeElement
        if (sidebar) this.menuService.sidebarWidth$.next(parseFloat(getComputedStyle(sidebar).width))

        if (!this.enableResize) return

        this.setupResize()
    }

    setupResize = () =>
        fromEvent(this.resizeHandle.nativeElement, 'mousedown')
            .pipe(
                switchMap(() =>
                    fromEvent<MouseEvent>(document, 'mousemove').pipe(takeUntil(fromEvent(document, 'mouseup')))
                ),
                coalesceWith(animationFrames()),
                map(e => {
                    const width = e.clientX // Just take the x coordinate as the new width
                    const sidebar = this.sidebar.nativeElement

                    sidebar.style.width = width + 'px'

                    const actualWidth = getComputedStyle(sidebar).width
                    return actualWidth
                }),
                distinctUntilChanged(),
                tap(width => this.menuService.sidebarWidth$.next(parseFloat(width))),
                debounceTime(600),
                tap(width => this.uiStateService.updateSidebarWidth(width)),
                untilDestroyed(this)
            )
            .subscribe()
}
