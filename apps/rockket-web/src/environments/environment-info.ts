export type NetlifyContext = 'production' | 'deploy-preview' | 'branch-deploy' | 'dev'
export type AppContext = 'Production' | 'Review' | 'Staging' | 'Development' | 'Testing'

interface Env {
    NG_APP_ENV: string
    NG_APP_PACKAGE_VERSION: string

    /** DEPLOYMENT ONLY */
    NG_APP_REVIEW_ID: string | undefined
    /** DEPLOYMENT ONLY */
    NG_APP_NETLIFY_CONTEXT: NetlifyContext | undefined

    NG_APP_TESTING_ENV: 'true' | undefined
    NG_APP_SERVER_BASE_URL: string | undefined

    WARNING?: string
}

declare const process: { env: Record<string, string | undefined> }
export const env: Env = (() => {
    try {
        return {
            NG_APP_ENV: process.env['NG_APP_ENV'] as string,
            NG_APP_PACKAGE_VERSION: process.env['NG_APP_PACKAGE_VERSION'] as string,

            NG_APP_REVIEW_ID: process.env['NG_APP_REVIEW_ID'],
            NG_APP_NETLIFY_CONTEXT: process.env['NG_APP_NETLIFY_CONTEXT'] as NetlifyContext | undefined,

            NG_APP_TESTING_ENV: process.env['NG_APP_TESTING_ENV'] as 'true' | undefined,
            NG_APP_SERVER_BASE_URL: process.env['NG_APP_SERVER_BASE_URL'],
        }
    } catch (error) {
        return {
            WARNING: 'Current build config does not support environment variables.',

            NG_APP_ENV: '',
            NG_APP_PACKAGE_VERSION: '',

            NG_APP_REVIEW_ID: undefined,
            NG_APP_NETLIFY_CONTEXT: undefined,

            NG_APP_TESTING_ENV: undefined,
            NG_APP_SERVER_BASE_URL: undefined,
        }
    }
})()

export const contextMap: Record<NetlifyContext | 'testing', AppContext> = {
    production: 'Production',
    'branch-deploy': 'Staging',
    'deploy-preview': 'Review',
    dev: 'Development',
    testing: 'Testing',
}

export const serverBaseUrls: Record<NetlifyContext | 'testing', string> = {
    production: 'https://rockket-production.up.railway.app',
    'branch-deploy': 'https://rockket-staging.up.railway.app', // Staging
    'deploy-preview': `https://server-rockket-pr-${env.NG_APP_REVIEW_ID}.up.railway.app`, // Review env (Pull Requests)
    dev: 'http://localhost:3000',
    testing: 'http://localhost:3001',
}

export const APP_INSIGHTS_CONNECTION_STRING =
    'InstrumentationKey=b312ca81-6062-4700-a2cf-6d91a1e3f602;IngestionEndpoint=https://westeurope-5.in.applicationinsights.azure.com/;LiveEndpoint=https://westeurope.livediagnostics.monitor.azure.com/'

export interface AppEnvironment {
    production: boolean
    PACKAGE_VERSION: string
    SERVER_BASE_URL: string
    CONTEXT: AppContext
    APP_INSIGHTS_CONNECTION_STRING: string
    /** DEPLOYMENT ONLY */
    REVIEW_ID: string | undefined
}
