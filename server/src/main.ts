import { Logger, ValidationPipe } from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import { NestFactory } from '@nestjs/core'
import { AppModule } from './app.module'
import * as appInsights from 'applicationinsights'

async function bootstrap(configService: ConfigService) {
    const APP_CONTEXT = configService.get('RAILWAY_ENVIRONMENT')
    const isTestingEnv = configService.get('TESTING_ENV') == 'true'
    const enableInsights =
        (APP_CONTEXT != 'Development' && !isTestingEnv) || configService.get('ENABLE_DEV_INSIGHTS') == 'true'

    if (enableInsights) {
        appInsights.setup().setSendLiveMetrics(true)
        appInsights.defaultClient.context.tags[appInsights.defaultClient.context.keys.cloudRole] = APP_CONTEXT
        appInsights.start()
    }

    const app = await NestFactory.create(AppModule, { cors: true })

    const corsConfig = {
        origin: '*',
        methods: ['GET', 'POST', 'PATCH', 'DELETE'],
        credentials: true,
    }
    // app.useWebSocketAdapter(new ExtendedIoAdapter(app, corsConfig));
    app.enableCors(corsConfig)

    app.useGlobalPipes(new ValidationPipe({ whitelist: true }))

    const port = configService.get('PORT') as number
    const logger = new Logger('Main')

    const beforeStartup = Date.now()
    await app.listen(port, () => {
        const startupTime = Date.now() - beforeStartup
        if (enableInsights) appInsights.defaultClient.trackMetric({ name: 'StartupTime', value: startupTime })

        logger.log(
            `Port: ${port}, Startup: ${startupTime}ms, Context: ${
                isTestingEnv ? '[TESTING] ' : ''
            }${APP_CONTEXT}, Insights: ${enableInsights}`,
        )
    })
}
bootstrap(new ConfigService())
