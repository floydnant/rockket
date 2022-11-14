import { contextMap, serverBaseUrls } from './environment-info'

const context = process.env.NG_APP_CONTEXT

export const environment = {
    production: true,
    PACKAGE_VERSION: process.env.NG_APP_PACKAGE_VERSION,
    SERVER_BASE_URL: process.env.NG_APP_SERVER_BASE_URL || serverBaseUrls[context || 'dev'],
    CONTEXT: contextMap[context || 'dev'],
}
