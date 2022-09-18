import { ConfigService } from '@nestjs/config'
import { NestFactory } from '@nestjs/core'
import { AppModule } from './app.module'

async function bootstrap(configService: ConfigService) {
    const app = await NestFactory.create(AppModule)
    await app.listen(configService.get('PORT') as number)
}
bootstrap(new ConfigService())
