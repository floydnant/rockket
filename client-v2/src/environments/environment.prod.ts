import { AppEnvironment, contextMap, serverBaseUrls } from './environment-info'

const isTestingEnv = process.env.NG_APP_TESTING_ENV == 'true'
const netlifyContext = process.env.NG_APP_NETLIFY_CONTEXT

const context = contextMap[isTestingEnv ? 'testing' : netlifyContext || 'dev']
const serverBaseUrl = serverBaseUrls[isTestingEnv ? 'testing' : netlifyContext || 'dev']

export const environment: AppEnvironment = {
    production: true,
    PACKAGE_VERSION: process.env.NG_APP_PACKAGE_VERSION,
    SERVER_BASE_URL: process.env.NG_APP_SERVER_BASE_URL || serverBaseUrl,
    CONTEXT: context,
}
