import { ChangeDetectionStrategy, Component, Input } from '@angular/core'
import { MenuService } from '../menu.service'

@Component({
    selector: 'app-menu-toggle',
    template: `
        <button
            class="py-2 px-4 md:hidden"
            (click)="toggleIsOpen()"
            data-test-name="menu-toggle"
            [attr.data-test-name]="'menu-toggle-' + index"
        >
            <app-icon *ngIf="isMenuOpen$ | async; else elseBlock" iconClass="fas fa-times"></app-icon>
            <ng-template #elseBlock>
                <app-icon iconClass="far fa-bars"></app-icon>
            </ng-template>
        </button>
    `,
    styleUrls: [],
    changeDetection: ChangeDetectionStrategy.OnPush,
})
export class MenuToggleComponent {
    constructor(private menuService: MenuService) {}

    @Input() index: string | number = 0

    isMenuOpen$ = this.menuService.isMenuOpen$
    toggleIsOpen() {
        this.menuService.toggleIsOpen()
    }
}
