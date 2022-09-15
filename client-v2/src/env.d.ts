// eslint-disable-next-line no-var
declare var process: {
    env: {
        NG_APP_ENV: string
        NG_APP_PACKAGE_VERSION: string
        // Replace the line below with your environment variable for better type checking
        [key: string]: string
    }
}
