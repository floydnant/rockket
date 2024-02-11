import { Logger } from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import { NestFactory } from '@nestjs/core'
import { AppModule } from './app.module'
import { InsightsService, setupInsights } from './insights.service'

async function bootstrap(configService: ConfigService) {
    const beforeStartup = Date.now()

    setupInsights(configService)

    const app = await NestFactory.create(AppModule, { cors: true })

    app.enableCors({
        origin: '*',
        methods: ['GET', 'POST', 'PATCH', 'DELETE'],
        credentials: true,
    })

    const port = configService.get('PORT') as number
    const logger = new Logger('Main')

    await app.listen(port, () => {
        const startupTime = Date.now() - beforeStartup
        const insightsService = app.get(InsightsService)
        insightsService.trackMetric({ name: 'StartupTime', value: startupTime })

        const APP_CONTEXT = configService.get('RAILWAY_ENVIRONMENT')
        const isTestingEnv = configService.get('TESTING_ENV') == 'true'

        logger.log(
            `Port: ${port}, Startup: ${startupTime}ms, Context: ${
                isTestingEnv ? '[TESTING] ' : ''
            }${APP_CONTEXT}, Insights: ${insightsService.isEnabled}`,
        )
    })
}
bootstrap(new ConfigService())
