import { ChangeDetectionStrategy, Component, Input } from '@angular/core'
import { UntilDestroy } from '@ngneat/until-destroy'
import { BehaviorSubject, distinctUntilChanged } from 'rxjs'
import { UiStateService } from 'src/app/services/ui-state.service'
import { uiDefaults } from 'src/app/shared/defaults'
import { MenuService } from '../sidebar-layout/menu.service'
import { MainPaneLayoutService } from './main-pane-layout.service'

@UntilDestroy()
@Component({
    selector: 'app-main-pane',
    templateUrl: './main-pane.component.html',
    styles: [
        `
            :host {
                @apply contents;
            }

            .main-header {
                @apply shadow-header z-30;
            }
            @media (max-width: 768px) {
                .main-header--mobile.hide {
                    @apply -translate-y-full;
                }
            }
        `,
    ],
    changeDetection: ChangeDetectionStrategy.OnPush,
})
export class MainPaneComponent {
    constructor(
        private menuService: MenuService,
        private uiStateService: UiStateService,
        private mainPaneLayoutService: MainPaneLayoutService,
    ) {}
    // @TODO: Implement these as user settings
    // @TODO: Make the prose width adjustable with a drag, or have a couple presets
    @Input() centerMainPanel = true
    @Input() sidepanelInCenteredPanel = false

    isScrolled$ = new BehaviorSubject<boolean>(false)
    scrollSpyIsScrolledMap = [false, false]
    get isScrolled() {
        return this.scrollSpyIsScrolledMap.some(isScrolled => isScrolled)
    }

    setTopSpyIntersecting(isIntersecting: boolean, spyIndex: number) {
        this.scrollSpyIsScrolledMap[spyIndex] = !isIntersecting
        this.isScrolled$.next(this.isScrolled)
    }
    setBottomSpyIntersecting(isIntersecting: boolean) {
        this.menuService.isBottomNavBorderVisible$.next(!isIntersecting)
    }

    sidepanelPortal$ = this.mainPaneLayoutService.sidePanelPortal$.pipe(distinctUntilChanged())

    minSidepanelWidth = 240
    maxSidepanelWidth = 480
    defaultSidepanelWidth = uiDefaults.mainView.SIDE_PANEL_WIDTH
    onResize(newWidth: number) {
        this.mainPaneLayoutService.sidePanelWidth$.next(newWidth)
    }

    sidepanelWidth$ = this.mainPaneLayoutService.sidePanelWidth$
    onResizeEnd(newWidth: number) {
        this.uiStateService.updateMainViewSidePanel(newWidth)
    }
}
