import { ErrorHandler, Injectable } from '@angular/core'
import { Router } from '@angular/router'
import { AngularPlugin } from '@microsoft/applicationinsights-angularplugin-js'
import { ApplicationInsights } from '@microsoft/applicationinsights-web'
import { Actions, ofType } from '@ngrx/effects'
import { distinctUntilChanged, map } from 'rxjs'
import { environment } from 'src/environments/environment'
import { authActions } from '../store/user/user.actions'

const enableInsights = environment.isDeployed
const role = `web-${environment.REVIEW_ID ? 'pr-' + environment.REVIEW_ID : environment.CONTEXT}`

@Injectable({
    providedIn: 'root',
})
export class InsightsService {
    constructor(private router: Router, private actions$: Actions) {
        if (!environment.isProduction)
            console.info('Insights enabled:', enableInsights, enableInsights ? `with role: ${role}` : '')

        this.appInsights.loadAppInsights() // Insights need to be loaded, in order to display errors correctly

        if (!enableInsights) return

        this.appInsights.addTelemetryInitializer(envelope => {
            if (envelope.tags) envelope.tags['ai.cloud.role'] = role
        })

        // Set user context
        this.actions$
            .pipe(
                ofType(authActions.loginOrSignupSuccess),
                map(action => action.id),
                distinctUntilChanged(),
            )
            .subscribe(userId => this.appInsights.setAuthenticatedUserContext(userId, undefined, true))

        // Clear user context
        this.actions$
            .pipe(
                ofType(
                    authActions.logoutProceed,
                    authActions.confirmLoginError,
                    authActions.loginOrSignupError,
                ),
            )
            .subscribe(() => this.appInsights.clearAuthenticatedUserContext())
    }

    private angularPlugin = new AngularPlugin()
    private appInsights = new ApplicationInsights({
        config: {
            connectionString: environment.APP_INSIGHTS_CONNECTION_STRING,
            extensions: [this.angularPlugin],
            extensionConfig: {
                [this.angularPlugin.identifier]: { router: this.router, errorServices: [new ErrorHandler()] },
            },
            disableTelemetry: !enableInsights,
            enableCorsCorrelation: true,
        },
    })
}
