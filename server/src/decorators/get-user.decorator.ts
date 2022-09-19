import { createParamDecorator, ExecutionContext } from '@nestjs/common'
import { User } from '@prisma/client'

export const GetUser = createParamDecorator<unknown, ExecutionContext>((_data, ctx) => {
    const req = ctx.switchToHttp().getRequest<object & { user: User }>()
    return req.user
})
