export type NetlifyContext = 'production' | 'deploy-preview' | 'branch-deploy' | 'dev'
export type AppContext = 'Production' | 'Review' | 'Staging' | 'Development' | 'Testing'

// @TODO: #230 Fix this `process is not defined` issue occuring in cypress, sometimes in the build (btw wtf, why not always?)
// eslint-disable-next-line no-var, @typescript-eslint/no-explicit-any
// var process: any = process || {
//     env: {},
// }

export const env = {
    NG_APP_ENV: process.env['NG_APP_ENV'] as string,
    NG_APP_PACKAGE_VERSION: process.env['NG_APP_PACKAGE_VERSION'] as string,

    /** DEPLOYMENT ONLY */
    NG_APP_REVIEW_ID: process.env['NG_APP_REVIEW_ID'],
    /** DEPLOYMENT ONLY */
    NG_APP_NETLIFY_CONTEXT: process.env['NG_APP_NETLIFY_CONTEXT'] as NetlifyContext | undefined,

    NG_APP_TESTING_ENV: process.env['NG_APP_TESTING_ENV'] as 'true' | undefined,
    NG_APP_SERVER_BASE_URL: process.env['NG_APP_SERVER_BASE_URL'],
}

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
    'deploy-preview': `https://server-todo-app-pr-${env.NG_APP_REVIEW_ID}.up.railway.app`, // Review env (Pull Requests)
    dev: 'http://localhost:3000',
    testing: 'http://localhost:3001',
}

export interface AppEnvironment {
    production: boolean
    PACKAGE_VERSION: string
    SERVER_BASE_URL: string
    CONTEXT: AppContext
    /** DEPLOYMENT ONLY */
    REVIEW_ID: string | undefined
}
