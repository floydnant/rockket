import { AfterViewInit, Component, ElementRef, Input, ViewChild } from '@angular/core'
import { UntilDestroy, untilDestroyed } from '@ngneat/until-destroy'
import { fromEvent, switchMap, takeUntil, tap } from 'rxjs'
import { DeviceService } from 'src/app/services/device.service'
import { MenuService } from './menu.service'

@UntilDestroy()
@Component({
    selector: 'app-sidebar-layout',
    templateUrl: './sidebar-layout.component.html',
    styleUrls: ['./sidebar-layout.component.css'],
})
export class SidebarLayoutComponent implements AfterViewInit {
    constructor(private menuService: MenuService, private deviceService: DeviceService) {}

    @Input() enableResize = true

    isMobileScreen$ = this.deviceService.isMobileScreen$

    isMenuOpen$ = this.menuService.isMenuOpen$
    isBottomNavBorderVisible$ = this.menuService.isBottomNavBorderVisible$

    isSidebarScrolled = false
    setScrollSpyIntersecting(isIntersecting: boolean) {
        this.isSidebarScrolled = !isIntersecting
    }

    @ViewChild('resizeHandle') resizeHandle!: ElementRef<HTMLDivElement>

    ngAfterViewInit(): void {
        if (!this.enableResize) return

        this.setupResize().subscribe()
    }

    setupResize = () =>
        fromEvent(this.resizeHandle.nativeElement, 'mousedown').pipe(
            switchMap(() =>
                fromEvent<MouseEvent>(document, 'mousemove').pipe(takeUntil(fromEvent(document, 'mouseup')))
            ),
            tap(e => {
                const sidebar = this.resizeHandle.nativeElement.parentElement as HTMLDivElement
                const currMouseX = e.clientX
                const newWidth = currMouseX + 'px'
                sidebar.style.width = newWidth
            }),
            untilDestroyed(this)
        )
}
