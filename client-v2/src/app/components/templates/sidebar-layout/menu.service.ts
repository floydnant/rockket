import { Injectable } from '@angular/core'
import { BehaviorSubject } from 'rxjs'

@Injectable({
    providedIn: 'root',
})
export class MenuService {
    private _isMenuOpen = new BehaviorSubject(true)
    get isMenuOpen$() {
        return this._isMenuOpen
    }

    setIsOpen(isOpen: boolean) {
        this._isMenuOpen.next(isOpen)
    }

    toggleIsOpen() {
        this._isMenuOpen.next(!this._isMenuOpen.value)
    }

    isBottomNavBorderVisible$ = new BehaviorSubject(false)
}
