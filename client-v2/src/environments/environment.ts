import { APP_INSIGHTS_CONNECTION_STRING, AppEnvironment, contextMap, env, serverBaseUrls } from './environment-info'
// This file can be replaced during build by using the `fileReplacements` array.
// `ng build` replaces `environment.ts` with `environment.prod.ts`.
// The list of file replacements can be found in `angular.json`.
const isTestingEnv = env.NG_APP_TESTING_ENV == 'true'

const context = contextMap[isTestingEnv ? 'testing' : 'dev']
const serverBaseUrl = serverBaseUrls[isTestingEnv ? 'testing' : 'dev']

export const environment: AppEnvironment = {
    production: false,
    PACKAGE_VERSION: env.NG_APP_PACKAGE_VERSION,
    SERVER_BASE_URL: env.NG_APP_SERVER_BASE_URL || serverBaseUrl,
    CONTEXT: context,
    REVIEW_ID: undefined,
    APP_INSIGHTS_CONNECTION_STRING,
}

/*
 * For easier debugging in development mode, you can import the following file
 * to ignore zone related error stack frames such as `zone.run`, `zoneDelegate.invokeTask`.
 *
 * This import should be commented out in production mode because it will have a negative impact
 * on performance if an error is thrown.
 */
// import 'zone.js/plugins/zone-error';  // Included with Angular CLI.
