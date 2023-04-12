import { Component, ErrorHandler, OnDestroy, OnInit } from '@angular/core'
import { Router } from '@angular/router'
import { AngularPlugin } from '@microsoft/applicationinsights-angularplugin-js'
import { ApplicationInsights } from '@microsoft/applicationinsights-web'
import { Actions, ofType } from '@ngrx/effects'
import { environment } from 'src/environments/environment'
import { authActions } from '../store/user/user.actions'
import { UntilDestroy, untilDestroyed } from '@ngneat/until-destroy'
import { distinctUntilChanged, map } from 'rxjs'

const enableInsights = environment.CONTEXT != 'Testing' && environment.CONTEXT != 'Development'
const role = `web-${environment.REVIEW_ID ? 'pr-' + environment.REVIEW_ID : environment.CONTEXT}`

@UntilDestroy()
@Component({
    selector: 'app-root',
    template: '<router-outlet></router-outlet>',
})
export class AppComponent implements OnInit, OnDestroy {
    appInsights: ApplicationInsights | null = null

    constructor(private router: Router, private actions$: Actions) {
        if (environment.CONTEXT != 'Production')
            console.info('Insights enabled:', enableInsights, enableInsights ? `with role: ${role}` : '')

        if (!enableInsights) return

        const angularPlugin = new AngularPlugin()
        this.appInsights = new ApplicationInsights({
            config: {
                connectionString: environment.APP_INSIGHTS_CONNECTION_STRING,
                extensions: [angularPlugin],
                extensionConfig: {
                    [angularPlugin.identifier]: { router: this.router, errorServices: [new ErrorHandler()] },
                },
                enableCorsCorrelation: true,
            },
        })
        this.appInsights.loadAppInsights()

        this.appInsights?.addTelemetryInitializer(envelope => {
            if (envelope.tags) envelope.tags['ai.cloud.role'] = role
        })

        // set user context
        this.actions$
            .pipe(
                ofType(authActions.loginOrSignupSuccess),
                map(action => action.id),
                distinctUntilChanged(),
                untilDestroyed(this)
            )
            .subscribe(userId => this.appInsights?.setAuthenticatedUserContext(userId, undefined, true))

        // clear user context
        this.actions$
            .pipe(
                ofType(authActions.logoutProceed, authActions.confirmLoginError, authActions.loginOrSignupError),
                untilDestroyed(this)
            )
            .subscribe(() => this.appInsights?.clearAuthenticatedUserContext())
    }

    ngOnInit() {
        // @TODO: the user should decide wether the OS context menu should be disabled or not
        document.addEventListener('contextmenu', this.callback)
    }
    ngOnDestroy() {
        document.removeEventListener('contextmenu', this.callback)
    }
    callback = ((e: Event) => e.preventDefault()).bind(this)
}
