import { INestApplication } from '@nestjs/common'
import { TestingModule, Test } from '@nestjs/testing'
import { AppModule } from '../src/app.module'
import * as superRequest from 'supertest'
import { SignupCredentialsDto, LoginCredentialsDto } from '../src/user/dto/auth-credetials.dto'
import { CreateTasklistDto } from 'src/task/list/list.dto'
import { Tasklist } from '@prisma/client'

export const initApplication = async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
        imports: [AppModule],
    }).compile()

    const app = moduleFixture.createNestApplication()
    return await app.init()
}

export const request = (app: INestApplication) => superRequest(app.getHttpServer())

export const signup = (app: INestApplication, credentials: SignupCredentialsDto) =>
    request(app).post('/auth/signup').send(credentials)
export const login = (app: INestApplication, credentials: LoginCredentialsDto) =>
    request(app).post('/auth/login').send(credentials)

export const typeBearer = { type: 'bearer' } as const

export const createTasklist = async (
    app: INestApplication,
    authToken: string,
    newList: CreateTasklistDto,
) => {
    const res = await request(app).post('/list').auth(authToken, typeBearer).send(newList).expect(201)
    return res.body as Tasklist
}
