/* eslint-disable @nx/enforce-module-boundaries */
import { INestApplication } from '@nestjs/common'
import { Task, Tasklist } from '@prisma/client'
import superRequest from 'supertest'
import { CreateTasklistDto } from '../../../rockket-backend/src/entities/list/list.dto'
import { CreateTaskDto } from '../../../rockket-backend/src/entities/task/task.dto'
import {
    LoginCredentialsDto,
    SignupCredentialsDto,
} from '../../../rockket-backend/src/user/dto/auth-credetials.dto'

export const request = (app: INestApplication) => {
    return superRequest(app.getHttpServer())
}

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

export const createTask = async (
    app: INestApplication,
    authToken: string,
    taskPayload: Partial<CreateTaskDto> & Pick<CreateTaskDto, 'title' | 'listId'>,
) => {
    const res = await request(app).post(`/task`).auth(authToken, typeBearer).send(taskPayload).expect(201)
    return res.body as Task
}
