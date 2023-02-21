import { ChangeDetectionStrategy, Component, Input } from '@angular/core'
import { MenuService } from '../sidebar-layout/menu.service'

@Component({
    selector: 'app-main-pane',
    templateUrl: './main-pane.component.html',
    styles: [
        `
            :host {
                @apply contents;
            }

            .main-header {
                @apply z-30 shadow-header;
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
    constructor(private menuService: MenuService) {}
    // @TODO: Make the prose width adjustable with a drag, or have a couple presets
    @Input() prose = true

    isScrolled = false
    setTopSpyIntersecting(isIntersecting: boolean) {
        this.isScrolled = !isIntersecting
    }
    setBottomSpyIntersecting(isIntersecting: boolean) {
        this.menuService.isBottomNavBorderVisible$.next(!isIntersecting)
    }
}
