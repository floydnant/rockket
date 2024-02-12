import { INestApplication } from '@nestjs/common'
import request from 'supertest'
import { initApplication } from '../utils/init-app.e2e-util'

describe('AppController (e2e)', () => {
    let app: INestApplication

    beforeEach(async () => {
        await app?.close()
        app = await initApplication()
    })

    it('/ (GET)', () => {
        return request(app.getHttpServer()).get('/').expect(200).expect('Hello World!')
    })
    it('/not-found (GET)', () => {
        return request(app.getHttpServer()).get('/not-found').expect(404)
    })
    it('/health (GET)', () => {
        return request(app.getHttpServer()).get('/health').expect(200)
    })
    it('/clear-db (GET)', () => {
        return request(app.getHttpServer()).get('/clear-db').expect(403)
    })
})
