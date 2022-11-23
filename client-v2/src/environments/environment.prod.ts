import { AppEnvironment, contextMap, env, serverBaseUrls } from './environment-info'

const isTestingEnv = env.NG_APP_TESTING_ENV == 'true'
const netlifyContext = env.NG_APP_NETLIFY_CONTEXT

const context = contextMap[isTestingEnv ? 'testing' : netlifyContext || 'dev']
const serverBaseUrl = serverBaseUrls[isTestingEnv ? 'testing' : netlifyContext || 'dev']

export const environment: AppEnvironment = {
    production: true,
    PACKAGE_VERSION: env.NG_APP_PACKAGE_VERSION,
    SERVER_BASE_URL: env.NG_APP_SERVER_BASE_URL || serverBaseUrl,
    CONTEXT: context,
}
