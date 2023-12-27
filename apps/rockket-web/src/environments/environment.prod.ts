import { APP_INSIGHTS_CONNECTION_STRING } from './env.static'
import { transformedEnv } from './env.transformed'
import { AppContext, AppEnvironment } from './env.types'

export const environment: AppEnvironment = {
    isDeployed:
        transformedEnv.CONTEXT == AppContext.Production ||
        transformedEnv.CONTEXT == AppContext.Staging ||
        transformedEnv.CONTEXT == AppContext.Review,
    isProduction: transformedEnv.CONTEXT == AppContext.Production,
    isProductionBuild: true,

    PACKAGE_VERSION: transformedEnv.PACKAGE_VERSION,
    SERVER_BASE_URL: transformedEnv.SERVER_BASE_URL,
    CONTEXT: transformedEnv.CONTEXT,
    REVIEW_ID: transformedEnv.REVIEW_ID,
    APP_INSIGHTS_CONNECTION_STRING,
}
console.log('prod environment', environment)
