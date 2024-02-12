import { Injectable, Logger, NestMiddleware } from '@nestjs/common'

import { NextFunction, Request, Response } from 'express'

@Injectable()
export class HttpLoggerMiddleware implements NestMiddleware {
    private logger = new Logger('Http')

    use(request: Request, response: Response, next: NextFunction): void {
        response.on('close', () => {
            this.logger.verbose(`${request.method} ${request.originalUrl} => ${response.statusCode}`)
        })

        next()
    }
}
