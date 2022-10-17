// eslint-disable-next-line no-var
declare var process: {
    env: {
        NG_APP_ENV: string
        NG_APP_PACKAGE_VERSION: string

        /** DEPLOYMENT ONLY */
        NG_APP_PULL_REQUEST?: string
        /** DEPLOYMENT ONLY */
        NG_APP_REVIEW_ID?: string

        NG_APP_SERVER_BASE_URL?: string

        [key: string]: string | undefined
    }
}
