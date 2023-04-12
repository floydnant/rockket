import { Injectable, Logger } from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import { TelemetryClient, defaultClient, setup, start } from 'applicationinsights'
import { MetricTelemetry } from 'applicationinsights/out/Declarations/Contracts'
import { InsightsNotSetupError } from './shared/errors.model'

let insights: {
    isEnabled: boolean
    client: TelemetryClient
} | null = null

export const setupInsights = (configService: ConfigService) => {
    if (insights) return insights

    const logger = new Logger('Insights')

    const APP_CONTEXT = configService.get('RAILWAY_ENVIRONMENT')
    const isTestingEnv = configService.get('TESTING_ENV') == 'true'
    const enableInsights =
        (APP_CONTEXT != 'Development' && !isTestingEnv) || configService.get('ENABLE_DEV_INSIGHTS') == 'true'

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
    constructor() {
        if (!insights) throw new InsightsNotSetupError()

        this.client = insights.client
        this.isEnabled = insights.isEnabled
    }

    private client: TelemetryClient
    isEnabled: boolean

    trackMetric(metric: MetricTelemetry) {
        if (!this.isEnabled) return

        this.client.trackMetric(metric)
    }
}
