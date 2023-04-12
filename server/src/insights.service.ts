import { Injectable, Logger } from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import { TelemetryClient, defaultClient, setup, start } from 'applicationinsights'
import { MetricTelemetry } from 'applicationinsights/out/Declarations/Contracts'
import { InsightsNotSetupError } from './shared/errors.model'

let insights: {
    isEnabled: boolean
    client: TelemetryClient
} | null = null

const shouldInsightsBeEnabled = (configService: ConfigService) => {
    const APP_CONTEXT = configService.get('RAILWAY_ENVIRONMENT')
    const isTestingEnv = configService.get('TESTING_ENV') == 'true'
    const enableDevInsights = configService.get('ENABLE_DEV_INSIGHTS') == 'true'

    return (APP_CONTEXT != 'Development' && !isTestingEnv) || enableDevInsights
}

export const setupInsights = (configService: ConfigService) => {
    if (insights) return insights

    const logger = new Logger('Insights')

    const APP_CONTEXT = configService.get('RAILWAY_ENVIRONMENT')
    const enableInsights = shouldInsightsBeEnabled(configService)

    if (enableInsights) {
        setup().setSendLiveMetrics(true)
        defaultClient.context.tags[defaultClient.context.keys.cloudRole] = APP_CONTEXT
        start()
    }

    logger.log(`Setting up ApplicationInsights: ${enableInsights}`)

    insights = {
        isEnabled: enableInsights,
        client: defaultClient,
    }
    return insights
}

@Injectable()
export class InsightsService {
    constructor(configService: ConfigService) {
        this.client = insights?.client ?? null
        this.isEnabled = insights?.isEnabled ?? shouldInsightsBeEnabled(configService)
    }

    private client: TelemetryClient | null
    isEnabled: boolean

    trackMetric(metric: MetricTelemetry) {
        if (!this.isEnabled) return
        if (!this.client) throw new InsightsNotSetupError()

        this.client.trackMetric(metric)
    }
}
