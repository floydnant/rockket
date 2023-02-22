import { Component } from '@angular/core'
import { Router } from '@angular/router'
import { HotToastService } from '@ngneat/hot-toast'
import { UntilDestroy, untilDestroyed } from '@ngneat/until-destroy'
import { Actions, ofType } from '@ngrx/effects'
import { Store } from '@ngrx/store'
import { first } from 'rxjs'
import { AppState } from 'src/app/store'
import { authActions } from 'src/app/store/user/user.actions'
import { userSelectors } from 'src/app/store/user/user.selectors'

@UntilDestroy()
@Component({
    templateUrl: './login-loading.component.html',
    styles: [],
})
export class LoginLoadingComponent {
    constructor(
        private actions$: Actions,
        private router: Router,
        private store: Store<AppState>,
        private toast: HotToastService
    ) {
        this.toast.close('confirm-login')
    }

    callbackUrl?: string

    storeSubscription = this.store
        .select(userSelectors.selectLoginState)
        .pipe(first(), untilDestroyed(this))
        .subscribe(({ isLoading, isLoggedIn }) => {
            if (isLoading) return
            // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
            if (isLoggedIn) this.router.navigateByUrl(this.callbackUrl!, { replaceUrl: true })
            else {
                // this.toast.error('Invalid session, please login again.')
                this.router.navigateByUrl('/auth', { replaceUrl: true })
            }
        })

    actionsSubscription = this.actions$
        .pipe(ofType(authActions.confirmLoginError, authActions.loginOrSignupSuccess), first(), untilDestroyed(this))
        .subscribe(({ type }) => {
            // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
            if (/success/.test(type)) this.router.navigateByUrl(this.callbackUrl!, { replaceUrl: true })
            else {
                this.toast.error('Invalid session, please login again.')
                this.router.navigateByUrl('/auth')
            }
        })
}
