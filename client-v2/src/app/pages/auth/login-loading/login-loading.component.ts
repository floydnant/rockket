import { Component, OnDestroy } from '@angular/core'
import { Router } from '@angular/router'
import { HotToastService } from '@ngneat/hot-toast'
import { Actions, ofType } from '@ngrx/effects'
import { Store } from '@ngrx/store'
import { Subscription, take } from 'rxjs'
import { AppState } from 'src/app/store'
import { authActions } from 'src/app/store/user/user.actions'
import { userSelectors } from 'src/app/store/user/user.selectors'

@Component({
    templateUrl: './login-loading.component.html',
    styles: [],
})
export class LoginLoadingComponent implements OnDestroy {
    constructor(
        private actions$: Actions,
        private router: Router,
        private store: Store<AppState>,
        private toast: HotToastService
    ) {
        this.toast.close('confirm-login')

        this.storeSubscription = this.store
            .select(userSelectors.selectLoginState)
            .pipe(take(1))
            .subscribe(({ isLoading, isLoggedIn }) => {
                if (isLoading) return
                // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
                if (isLoggedIn) this.router.navigateByUrl(this.callbackUrl!)
                else {
                    // this.toast.error('Invalid session, please login again.')
                    this.router.navigateByUrl('/auth')
                }
            })

        this.actionsSubscription = this.actions$
            .pipe(ofType(authActions.confirmLoginError, authActions.loginOrSignupSuccess), take(1))
            .subscribe(({ type }) => {
                // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
                if (/success/.test(type)) this.router.navigateByUrl(this.callbackUrl!)
                else {
                    this.toast.error('Invalid session, please login again.')
                    this.router.navigateByUrl('/auth')
                }
            })
    }

    ngOnDestroy(): void {
        this.storeSubscription.unsubscribe()
        this.actionsSubscription.unsubscribe()
    }

    storeSubscription!: Subscription
    actionsSubscription!: Subscription

    callbackUrl?: string
}
