import { Component, Input } from '@angular/core'
import { UntilDestroy } from '@ngneat/until-destroy'
import { DeviceService } from 'src/app/services/device.service'
import { UiStateService } from 'src/app/services/ui-state.service'
import { MenuService } from './menu.service'

@UntilDestroy()
@Component({
    selector: 'app-sidebar-layout',
    templateUrl: './sidebar-layout.component.html',
    styleUrls: ['./sidebar-layout.component.css'],
})
export class SidebarLayoutComponent {
    constructor(
        private menuService: MenuService,
        private deviceService: DeviceService,
        private uiStateService: UiStateService,
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

    onResize(newWidth: number) {
        this.menuService.sidebarWidth$.next(newWidth)
    }
    onResizeEnd(newWidth: number) {
        this.uiStateService.updateSidebarWidth(newWidth + 'px')
    }
}
