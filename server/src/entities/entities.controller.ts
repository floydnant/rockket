import { Controller, Get, Query, UseGuards } from '@nestjs/common'
import { AuthGuard } from '@nestjs/passport'
import { User } from '@prisma/client'
import { GetUser } from '../decorators/get-user.decorator'
import { EntitiesService } from './entities.service'

@UseGuards(AuthGuard())
@Controller('entities')
export class EntitiesController {
    constructor(private entitiesService: EntitiesService) {}

    @Get()
    getAllTasklists(@GetUser() user: User) {
        return this.entitiesService.getEntityPreviews(user.id)
    }

    @Get('search')
    search(@GetUser() user: User, @Query('q') query: string) {
        return this.entitiesService.search(user.id, query)
    }
}
