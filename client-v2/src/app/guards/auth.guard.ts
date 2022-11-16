import { Injectable } from '@angular/core'
import { ActivatedRouteSnapshot, CanActivate, Router, RouterStateSnapshot } from '@angular/router'
import { Store } from '@ngrx/store'
import { filter, map, take } from 'rxjs'
import { AppState } from '../store'

@Injectable({
    providedIn: 'root',
})
export class AuthGuard implements CanActivate {
    constructor(private store: Store<AppState>, private router: Router) {}

    canActivate(_route: ActivatedRouteSnapshot, routerState: RouterStateSnapshot) {
        return this.store
            .select(state => state.user)
            .pipe(
                filter(userState => !userState.isLoading), // wait for ongoing login process to complete
                map(({ isLoggedIn }) => isLoggedIn || this.router.parseUrl(`/auth?callback=${routerState.url}`)),
                take(1) // not sure if this is necessary, but better safe than sorry
            )
    }
}
