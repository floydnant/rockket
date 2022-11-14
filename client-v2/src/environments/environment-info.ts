export const envMap: Record<NetlifyContext, AppEnvironment> = {
    production: 'Production',
    'branch-deploy': 'Staging',
    'deploy-preview': 'Review',
    dev: 'Development',
}

export const reviewId = process.env.NG_APP_REVIEW_ID

export const serverBaseUrls: Record<NetlifyContext, string> = {
    production: 'https://rockket-production.up.railway.app',
    'branch-deploy': 'https://rockket-staging.up.railway.app', // Staging
    'deploy-preview': `https://server-todo-app-pr-${reviewId}.up.railway.app`, // Review env (Pull Requests)
    dev: 'http://localhost:3000',
}
