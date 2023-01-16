import { Controller, Get, UseGuards } from '@nestjs/common'
import { AuthGuard } from '@nestjs/passport'
import { User } from '@prisma/client'
import { GetUser } from 'src/decorators/get-user.decorator'
import { EntitiesService } from './entities.service'

@UseGuards(AuthGuard())
@Controller('entities')
export class EntitiesController {
    constructor(private entitiesService: EntitiesService) {}

    @Get()
    getAllTasklists(@GetUser() user: User) {
        return this.entitiesService.getEntityPreviews(user.id)
    }
}
