/* eslint-disable @nx/enforce-module-boundaries */
import { INestApplication } from '@nestjs/common'
import { Task, Tasklist } from '@prisma/client'
import { CreateTasklistZodDto } from 'apps/rockket-backend/src/entities/list/list.dto'
import { CreateTaskZodDto } from 'apps/rockket-backend/src/entities/task/task.dto'
import { SignupZodDto, LoginZodDto } from 'apps/rockket-backend/src/user/user.dto'
import superRequest from 'supertest'

export const request = (app: INestApplication) => {
    return superRequest(app.getHttpServer())
}

export const signup = (app: INestApplication, credentials: SignupZodDto) =>
    request(app).post('/auth/signup').send(credentials)
export const login = (app: INestApplication, credentials: LoginZodDto) =>
    request(app).post('/auth/login').send(credentials)

export const typeBearer = { type: 'bearer' } as const

export const createTasklist = async (
    app: INestApplication,
    authToken: string,
    newList: CreateTasklistZodDto,
) => {
    const res = await request(app).post('/list').auth(authToken, typeBearer).send(newList).expect(201)
    return res.body as Tasklist
}

export const createTask = async (
    app: INestApplication,
    authToken: string,
    taskPayload: Partial<CreateTaskZodDto> & Pick<CreateTaskZodDto, 'title' | 'listId'>,
) => {
    const res = await request(app).post(`/task`).auth(authToken, typeBearer).send(taskPayload).expect(201)
    return res.body as Task
}
