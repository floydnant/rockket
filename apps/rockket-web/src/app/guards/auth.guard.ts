import { Injectable } from '@angular/core'
import { ActivatedRouteSnapshot, Router, RouterStateSnapshot } from '@angular/router'
import { Store } from '@ngrx/store'
import { first, map } from 'rxjs'
import { AppState } from '../store'

@Injectable({
    providedIn: 'root',
})
export class AuthGuard {
    constructor(private store: Store<AppState>, private router: Router) {}

    canActivate(_route: ActivatedRouteSnapshot, routerState: RouterStateSnapshot) {
        return this.store
            .select(state => state.user)
            .pipe(
                first(), // Not sure if this is necessary, but better safe than sorry
                // filter(userState => !userState.isLoading), // wait for ongoing login process to complete
                map(({ isLoggedIn, isLoading }) => {
                    if (isLoggedIn) return true

                    if (isLoading) return this.router.parseUrl(`/auth/login-loading?callback=${routerState.url}`)
                    return this.router.parseUrl(`/auth?callback=${routerState.url}`)
                })
            )
    }
}
