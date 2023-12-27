import { rawEnv } from './env.generated'
import { APP_INSIGHTS_CONNECTION_STRING, appContextMap } from './env.static'
import {
    AppContext,
    AppEnvironment,
    RawEnvironmentVariables,
    RawInlineEnvironmentVariables,
    rawEnvSchema,
    rawInlineEnvSchema,
} from './env.types'

declare const process: { env: Record<string, string | undefined> }

const getParsedInlineEnv = (): Partial<RawInlineEnvironmentVariables> => {
    try {
        const result = rawInlineEnvSchema.safeParse(process.env)
        if (result.success) return result.data

        console.warn('Ignoring inline env vars because of validation issues:', result.error)
        return {}
    } catch (err) {
        console.warn(
            'Skipping inline env vars because current build config does not support inline environment variables (env vars directly replaced by the webpack build plugin):',
            err,
        )
        return {}
    }
}

const getParsedEnv = (): RawEnvironmentVariables => {
    const result = rawEnvSchema.safeParse(rawEnv)
    if (result.success) return result.data

    console.error('Invalid environment variables, received:', rawEnv)
    throw result.error
}

const parsedInlineEnv = getParsedInlineEnv()
const parsedEnv = getParsedEnv()

const isTestingEnv = (parsedInlineEnv.NG_APP_TESTING_ENV || parsedEnv.NG_APP_TESTING_ENV) == 'true'
const netlifyContext = parsedInlineEnv.NG_APP_NETLIFY_CONTEXT || parsedEnv.NG_APP_NETLIFY_CONTEXT
const context: AppContext = isTestingEnv ? AppContext.Testing : appContextMap[netlifyContext || 'dev']

const reviewId = parsedInlineEnv.NG_APP_REVIEW_ID || parsedEnv.NG_APP_REVIEW_ID
if (context === AppContext.Review && !reviewId) {
    console.warn(`Context is "${AppContext.Review}" but env var \`REVIEW_ID\` is missing`)
}

const serverBaseUrlMap = {
    [AppContext.Production]: 'https://rockket-production.up.railway.app',
    [AppContext.Staging]: 'https://rockket-staging.up.railway.app',
    [AppContext.Review]: `https://server-rockket-pr-${reviewId}.up.railway.app`,
    [AppContext.Development]: 'http://localhost:3000',
    [AppContext.Testing]: 'http://localhost:3001',
} as const satisfies Record<AppContext, string>

const serverBaseUrl =
    parsedInlineEnv.NG_APP_SERVER_BASE_URL || parsedEnv.NG_APP_SERVER_BASE_URL || serverBaseUrlMap[context]

export const baseEnvironment: Omit<AppEnvironment, 'isProductionBuild'> = {
    isDeployed:
        context == AppContext.Production || // Forced line break
        context == AppContext.Staging ||
        context == AppContext.Review,
    isProduction: context == AppContext.Production,

    CONTEXT: context,
    REVIEW_ID: reviewId,
    SERVER_BASE_URL: serverBaseUrl,
    PACKAGE_VERSION: parsedEnv.NG_APP_PACKAGE_VERSION,
    APP_INSIGHTS_CONNECTION_STRING,
}
