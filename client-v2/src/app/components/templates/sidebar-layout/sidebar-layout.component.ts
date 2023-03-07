import { AfterViewInit, Component, ElementRef, Input, ViewChild } from '@angular/core'
import { UntilDestroy, untilDestroyed } from '@ngneat/until-destroy'
import { coalesceWith } from '@rx-angular/cdk/coalescing'
import {
    animationFrames,
    debounceTime,
    distinctUntilChanged,
    fromEvent,
    map,
    switchMap,
    takeUntil,
    tap,
    timer,
} from 'rxjs'
import { DeviceService } from 'src/app/services/device.service'
import { UiStateService } from 'src/app/services/ui-state.service'
import { MenuService } from './menu.service'

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

    ngAfterViewInit(): void {
        if (!this.enableResize) return

        this.setupResize()
    }

    setupResize = () =>
        fromEvent(this.resizeHandle.nativeElement, 'mousedown')
            .pipe(
                switchMap(() =>
                    fromEvent<MouseEvent>(document, 'mousemove').pipe(takeUntil(fromEvent(document, 'mouseup')))
                ),
                map(e => e.clientX + 'px'), // just take the x coordinate as the new width
                // coalesceWith(animationFrames()),
                coalesceWith(timer(3)),
                distinctUntilChanged(),
                tap(width => {
                    console.log('updating width')
                    const sidebar = this.resizeHandle.nativeElement.parentElement as HTMLDivElement
                    sidebar.style.width = width
                }),
                debounceTime(600),
                tap(width => this.uiStateService.updateSidebarWidth(width)),
                untilDestroyed(this)
            )
            .subscribe()
}
