import { Controller, Get, Logger } from '@nestjs/common'
import { AppService } from './app.service'

@Controller()
export class AppController {
    constructor(private readonly appService: AppService) {}
    logger = new Logger('AppController')

    @Get()
    getHello(): string {
        return this.appService.getHello()
    }

    @Get('/health')
    getHealth() {
        return { message: 'running' }
    }

    @Get('/clear-db')
    clearDb() {
        this.logger.verbose('Clearing database')
        return this.appService.clearDb()
    }
}
