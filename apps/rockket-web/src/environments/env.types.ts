import { z } from 'zod'

// @TODO: this type should live in a global type file
/**
 * Only cares about keys and sets values to `unknown`.
 *
 * This is useful for preparing the shape of an object without having the exact types yet and then validate later on.
 */
export type Roughly<T> = { [K in keyof T]: T[K] extends object ? Roughly<T[K]> : unknown }

/** Returns `undefined` for unresolved shell variables (if the string starts with `$`) */
const shellVarTransformer = (value: string | undefined) => {
    if (value?.startsWith('$')) return undefined
    return value
}

export const netlifyContextEnumSchema = z.enum(['production', 'deploy-preview', 'branch-deploy', 'dev'])
export type NetlifyContext = z.infer<typeof netlifyContextEnumSchema>

const baseRawEnvSchema = z.object({
    NG_APP_TESTING_ENV: z.literal('true').optional(),
    NG_APP_SERVER_BASE_URL: z.string().optional().transform(shellVarTransformer),
    NG_APP_NETLIFY_CONTEXT: netlifyContextEnumSchema.optional(),
    NG_APP_REVIEW_ID: z.string().optional().transform(shellVarTransformer),
})
const rawEnvSchemaSuperRefinement = (
    rawEnv: z.infer<typeof baseRawEnvSchema>,
    ctx: z.RefinementCtx,
): void => {
    if (rawEnv.NG_APP_NETLIFY_CONTEXT == 'deploy-preview' && !rawEnv.NG_APP_REVIEW_ID) {
        ctx.addIssue({
            code: z.ZodIssueCode.custom,
            message: 'NG_APP_NETLIFY_CONTEXT is "deploy-preview" but env var REVIEW_ID is missing',
            path: ['NG_APP_REVIEW_ID'],
        })
    }
}

export const rawInlineEnvSchema = baseRawEnvSchema.superRefine(rawEnvSchemaSuperRefinement)
export type RawInlineEnvironmentVariables = Readonly<z.infer<typeof rawInlineEnvSchema>>

export const rawEnvSchema = baseRawEnvSchema
    .extend({ NG_APP_PACKAGE_VERSION: z.string() })
    .superRefine(rawEnvSchemaSuperRefinement)
export type RawEnvironmentVariables = Readonly<z.infer<typeof rawEnvSchema>>

export enum AppContext {
    Production = 'production',
    Staging = 'staging',
    /** Preview deploys (Pull Requests) */
    Review = 'review',
    /** When developing locally */
    Development = 'development',
    /** When running tests */
    Testing = 'testing',
}

export type AppEnvironment = Readonly<{
    /** Wether the app is running in production, i.e. `CONTEXT == AppContext.Production` */
    isProduction: boolean
    /** Wether the app is deployed onto a remote machine, i.e. `CONTEXT == AppContext.Production | AppContext.Staging | AppContext.Review` */
    isDeployed: boolean
    /** Wether the production build configuration is used */
    isProductionBuild: boolean

    CONTEXT: AppContext
    PACKAGE_VERSION: string
    SERVER_BASE_URL: string
    APP_INSIGHTS_CONNECTION_STRING: string
    /** Id of the pull request the environment is linked to (DEPLOYMENT ONLY) */
    REVIEW_ID: string | undefined
}>
