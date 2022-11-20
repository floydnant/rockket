export const contextMap: Record<NetlifyContext | 'testing', AppContext> = {
    production: 'Production',
    'branch-deploy': 'Staging',
    'deploy-preview': 'Review',
    dev: 'Development',
    testing: 'Testing',
}

export const reviewId = process.env.NG_APP_REVIEW_ID

export const serverBaseUrls: Record<NetlifyContext | 'testing', string> = {
    production: 'https://rockket-production.up.railway.app',
    'branch-deploy': 'https://rockket-staging.up.railway.app', // Staging
    'deploy-preview': `https://server-todo-app-pr-${reviewId}.up.railway.app`, // Review env (Pull Requests)
    dev: 'http://localhost:3000',
    testing: 'http://localhost:3001',
}

export interface AppEnvironment {
    production: boolean
    PACKAGE_VERSION: string
    SERVER_BASE_URL: string
    CONTEXT: AppContext
}
