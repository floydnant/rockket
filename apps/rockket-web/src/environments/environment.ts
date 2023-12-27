import { APP_INSIGHTS_CONNECTION_STRING } from './env.static'
import { transformedEnv } from './env.transformed'
import { AppContext, AppEnvironment } from './env.types'

export const environment: AppEnvironment = {
    isDeployed:
        transformedEnv.CONTEXT == AppContext.Production ||
        transformedEnv.CONTEXT == AppContext.Staging ||
        transformedEnv.CONTEXT == AppContext.Review,
    isProduction: transformedEnv.CONTEXT == AppContext.Production,
    isProductionBuild: false,

    PACKAGE_VERSION: transformedEnv.PACKAGE_VERSION,
    SERVER_BASE_URL: transformedEnv.SERVER_BASE_URL,
    CONTEXT: transformedEnv.CONTEXT,
    REVIEW_ID: transformedEnv.REVIEW_ID,
    APP_INSIGHTS_CONNECTION_STRING,
}
console.log('environment', environment)

/*
 * For easier debugging in development mode, you can import the following file
 * to ignore zone related error stack frames such as `zone.run`, `zoneDelegate.invokeTask`.
 *
 * This import should be commented out in production mode because it will have a negative impact
 * on performance if an error is thrown.
 */
// import 'zone.js/plugins/zone-error';  // Included with Angular CLI.
