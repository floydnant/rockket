import { INestApplication } from '@nestjs/common'
import { PrismaClient, Tasklist } from '@prisma/client'
import { CreateTasklistDto, UpdateTasklistDto } from 'src/task/list/list.dto'
import { DbHelper } from './db-helper'
import { users } from './fixtures'
import { initApplication, request, signup, typeBearer } from './testing-utils'

const dbHelper = new DbHelper(new PrismaClient(), { cacheTableNames: true })

// @TODO: look into socket testing https://socket.io/docs/v4/testing/#example-with-jest

describe('Task feature (e2e)', () => {
    let app: INestApplication
    let authToken: string

    beforeEach(async () => {
        await dbHelper.clearDb()
        app = await initApplication()

        await signup(app, users.jonathan)
            .expect(201)
            .then(async (res) => {
                authToken = res.body.user.authToken
            })
    })

    const newList: CreateTasklistDto = {
        name: 'The new tasklist',
    }

    it.skip('can create a tasklist', async () => {
        await request(app)
            .post('/list')
            .auth(authToken, typeBearer)
            .send(newList)
            .expect(201)
            .then((res) => {
                const createdList = res.body
                expect(createdList.name).toEqual(newList.name)
            })
    })
    it.skip('can update a tasklist', async () => {
        const createdList: Tasklist = await request(app)
            .post('/list')
            .auth(authToken, typeBearer)
            .send(newList)
            .expect(201)
            .then((res) => res.body)
        const updatedListData: UpdateTasklistDto = {
            description: 'A new description',
        }
        await request(app).patch(`/list/${createdList.id}`).send(updatedListData).expect(200)
    })
    it.skip('can delete a tasklist', async () => {
        const createdList: Tasklist = await request(app)
            .post('/list')
            .auth(authToken, typeBearer)
            .send(newList)
            .expect(201)
            .then((res) => res.body)
        await request(app).delete(`/list/${createdList.id}`).expect(200)
    })

    it.todo('can add a child-tasklist')

    // @TODO: test moving lists around the hierarchy

    // ListParticipants
    it.skip('can share a list with other users', () => {
        // create a list
        // create another user
        // share the list with the new user
        // check if the new user has access to the list
    })

    describe('Tasks', () => {
        beforeEach(async () => {
            // @TODO: create a tasklist here
        })

        it.todo('can create a task')
        it.todo("can update a task's title")
        it.todo("can update a task's status")
        it.todo("can update a task's priority")
        it.todo("can update a task's description")
        it.todo('can delete a task')

        // @TODO: test blocking tasks

        it.todo('can add a subtask')

        // @TODO: test TaskComments
    })
})
