import { z } from 'zod'
import { rawEnv } from './env.generated'
import { appContextMap } from './env.static'
import {
    AppContext,
    RawInlineEnvironmentVariables,
    Roughly,
    TransformedEnvironmentVariables,
    rawEnvSchema,
    rawInlineEnvSchema,
} from './env.types'

declare const process: { env: Record<string, string | undefined> }

const getParsedInlineEnv = (): Partial<RawInlineEnvironmentVariables> => {
    try {
        const inlineEnv: Roughly<RawInlineEnvironmentVariables> = {
            NG_APP_REVIEW_ID: process.env['NG_APP_REVIEW_ID'],
            NG_APP_NETLIFY_CONTEXT: process.env['NG_APP_NETLIFY_CONTEXT'],

            NG_APP_TESTING_ENV: process.env['NG_APP_TESTING_ENV'] as 'true' | undefined,
            NG_APP_SERVER_BASE_URL: process.env['NG_APP_SERVER_BASE_URL'],
        }

        return rawInlineEnvSchema.parse(inlineEnv)
    } catch (err) {
        if (err instanceof z.ZodError) {
            console.error('Skipping inline env vars because of validation issues:', err)
            return {}
        }

        console.error(
            'Skipping inline env vars because current build config does not support inline environment variables (env vars directly replaced by the webpack build plugin):',
            err,
        )
        return {}
    }
}

const parsedInlineEnv = getParsedInlineEnv()
const parsedEnv = rawEnvSchema.parse(rawEnv)

const isTestingEnv = (parsedInlineEnv.NG_APP_TESTING_ENV || parsedEnv.NG_APP_TESTING_ENV) == 'true'
const netlifyContext = parsedInlineEnv.NG_APP_NETLIFY_CONTEXT || parsedEnv.NG_APP_NETLIFY_CONTEXT
const context: AppContext = isTestingEnv ? AppContext.Testing : appContextMap[netlifyContext || 'dev']

const reviewId = parsedInlineEnv.NG_APP_REVIEW_ID || parsedEnv.NG_APP_REVIEW_ID

export const serverBaseUrlMap = {
    [AppContext.Production]: 'https://rockket-production.up.railway.app',
    [AppContext.Staging]: 'https://rockket-staging.up.railway.app',
    [AppContext.Review]: `https://server-rockket-pr-${reviewId}.up.railway.app`,
    [AppContext.Development]: 'http://localhost:3000',
    [AppContext.Testing]: 'http://localhost:3001',
} as const satisfies Record<AppContext, string>

if (context === AppContext.Review && !reviewId) {
    throw new Error(`Context is "${AppContext.Review}" but env var \`REVIEW_ID\` is missing`)
}

const serverBaseUrl =
    parsedInlineEnv.NG_APP_SERVER_BASE_URL || parsedEnv.NG_APP_SERVER_BASE_URL || serverBaseUrlMap[context]

export const transformedEnv: TransformedEnvironmentVariables = {
    PACKAGE_VERSION: parsedEnv.NG_APP_PACKAGE_VERSION,
    CONTEXT: context,
    SERVER_BASE_URL: serverBaseUrl,
    REVIEW_ID: reviewId,
}
