import { AppContext, NetlifyContext } from './env.types'

export const appContextMap = {
    production: AppContext.Production,
    'branch-deploy': AppContext.Staging,
    'deploy-preview': AppContext.Review,
    dev: AppContext.Development,
    testing: AppContext.Testing,
} satisfies Record<NetlifyContext | 'testing', AppContext>

export const APP_INSIGHTS_CONNECTION_STRING =
    'InstrumentationKey=b312ca81-6062-4700-a2cf-6d91a1e3f602;IngestionEndpoint=https://westeurope-5.in.applicationinsights.azure.com/;LiveEndpoint=https://westeurope.livediagnostics.monitor.azure.com/'
