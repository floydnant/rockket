import { Logger, ValidationPipe } from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import { NestFactory } from '@nestjs/core'
import { AppModule } from './app.module'
import { defaultClient, setup as setupInsights, start as startInsights } from 'applicationinsights'

async function bootstrap(configService: ConfigService) {
    const beforeStartup = Date.now()

    const APP_CONTEXT = configService.get('RAILWAY_ENVIRONMENT')
    const isTestingEnv = configService.get('TESTING_ENV') == 'true'
    const enableInsights =
        (APP_CONTEXT != 'Development' && !isTestingEnv) || configService.get('ENABLE_DEV_INSIGHTS') == 'true'

    if (enableInsights) {
        setupInsights().setSendLiveMetrics(true)
        defaultClient.context.tags[defaultClient.context.keys.cloudRole] = APP_CONTEXT
        startInsights()
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

    await app.listen(port, () => {
        const startupTime = Date.now() - beforeStartup
        if (enableInsights) defaultClient.trackMetric({ name: 'StartupTime', value: startupTime })

        logger.log(
            `Port: ${port}, Startup: ${startupTime}ms, Context: ${
                isTestingEnv ? '[TESTING] ' : ''
            }${APP_CONTEXT}, Insights: ${enableInsights}`,
        )
    })
}
bootstrap(new ConfigService())
