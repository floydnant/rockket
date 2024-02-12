import { Injectable } from '@angular/core'
import { BehaviorSubject } from 'rxjs'
import { UiStateService } from 'src/app/services/ui-state.service'

@Injectable({
    providedIn: 'root',
})
export class MenuService {
    constructor(private uiStateService: UiStateService) {
        this.isMenuOpen$_.subscribe(isOpen => {
            this.uiStateService.toggleMobileMenu(isOpen)
        })
    }

    private isMenuOpen$_ = new BehaviorSubject(this.uiStateService.sidebarUiState.isMobileMenuOpen)
    get isMenuOpen$() {
        return this.isMenuOpen$_
    }

    setIsOpen(isOpen: boolean) {
        this.isMenuOpen$_.next(isOpen)
    }

    toggleIsOpen() {
        this.isMenuOpen$_.next(!this.isMenuOpen$_.value)
    }

    isBottomNavBorderVisible$ = new BehaviorSubject(false)

    sidebarWidth$ = new BehaviorSubject<number>(parseFloat(this.uiStateService.sidebarUiState.width || '0'))
}
