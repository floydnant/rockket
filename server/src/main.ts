import { ValidationPipe } from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import { NestFactory } from '@nestjs/core'
import { AppModule } from './app.module'

async function bootstrap(configService: ConfigService) {
    const app = await NestFactory.create(AppModule, { cors: true })

    const corsConfig = {
        origin: '*',
        methods: ['GET', 'POST', 'PATCH', 'DELETE'],
        credentials: true,
    }
    // app.useWebSocketAdapter(new ExtendedIoAdapter(app, corsConfig));
    app.enableCors(corsConfig)

    app.useGlobalPipes(new ValidationPipe())

    await app.listen(configService.get('PORT') as number)
}
bootstrap(new ConfigService())
