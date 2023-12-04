import { NestInterceptor, ExecutionContext, Injectable, CallHandler } from '@nestjs/common'
import { instanceToPlain } from 'class-transformer'
import { map } from 'rxjs'

@Injectable()
export class TransformInterceptor implements NestInterceptor {
    intercept(_context: ExecutionContext, next: CallHandler<unknown>) {
        return next.handle().pipe(map((data) => instanceToPlain(data)))
    }
}
