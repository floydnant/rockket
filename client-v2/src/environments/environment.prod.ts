const isReviewEnv = process.env.NG_APP_PULL_REQUEST == 'true'
const reviewId = process.env.NG_APP_REVIEW_ID

// type env = 'Development' | 'Review' | 'Staging' | 'Production'

const url = {
    prod: 'https://rockket-production.up.railway.app',
    staging: 'https://rockket-staging.up.railway.app',
    review: `https://server-todo-app-pr-${reviewId}.up.railway.app/`,
}

export const environment = {
    production: true,
    PACKAGE_VERSION: process.env.NG_APP_PACKAGE_VERSION,
    SERVER_BASE_URL: process.env.NG_APP_SERVER_BASE_URL || (isReviewEnv ? url.review : url.prod),
}
