declare type NetlifyContext = 'production' | 'deploy-preview' | 'branch-deploy' | 'dev'
declare type AppContext = 'Production' | 'Review' | 'Staging' | 'Development' | 'Testing'

// eslint-disable-next-line no-var
declare var process: {
    env: {
        NG_APP_ENV: string
        NG_APP_PACKAGE_VERSION: string

        /** DEPLOYMENT ONLY */
        NG_APP_REVIEW_ID?: string
        /** DEPLOYMENT ONLY */
        NG_APP_NETLIFY_CONTEXT?: NetlifyContext

        NG_APP_TESTING_ENV?: 'true'
        NG_APP_SERVER_BASE_URL?: string

        [key: string]: string | undefined
    }
}
