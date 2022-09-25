import { INestApplication } from '@nestjs/common'
import { PrismaClient, Tasklist } from '@prisma/client'
import { CreateTasklistDto, UpdateTasklistDto } from '../src/task/list/list.dto'
import { DbHelper } from './db-helper'
import { users } from './fixtures'
import { createTasklist, initApplication, request, signup, typeBearer } from './testing-utils'

const dbHelper = new DbHelper(new PrismaClient(), { cacheTableNames: true })

// @TODO: look into socket testing https://socket.io/docs/v4/testing/#example-with-jest

describe('Task feature (e2e)', () => {
    let app: INestApplication
    let authToken: string

    beforeEach(async () => {
        await dbHelper.clearDb()
        app = await initApplication()

        const res = await signup(app, users.jonathan).expect(201)
        authToken = res.body.user.authToken
    })

    const newList: CreateTasklistDto = {
        name: 'The new tasklist',
    }

    it('can create a tasklist', async () => {
        const createdList: Tasklist = await createTasklist(app, authToken, newList)
        expect(createdList.name).toEqual(newList.name)
    })
    it('can update a tasklist', async () => {
        const createdList = await createTasklist(app, authToken, newList)

        const updatedListData: UpdateTasklistDto = {
            description: 'A new description',
        }
        const res = await request(app)
            .patch(`/list/${createdList.id}`)
            .auth(authToken, typeBearer)
            .send(updatedListData)
            .expect(200)
        const updatedList = res.body as Tasklist
        expect(updatedList.description).toEqual(updatedListData.description)
    })
    it('can delete a tasklist', async () => {
        const createdList: Tasklist = await createTasklist(app, authToken, newList)

        await request(app).delete(`/list/${createdList.id}`).auth(authToken, typeBearer).expect(200)
    })

    it('can add a child-tasklist', async () => {
        const createdList = await createTasklist(app, authToken, newList)
        await createTasklist(app, authToken, {
            ...newList,
            parentListId: createdList.id,
        })

        const res = await request(app).get(`/list/${createdList.id}`).auth(authToken, typeBearer).expect(200)
        expect(res.body.childLists.length).toEqual(1)
    })

    // @TODO: test moving lists around the hierarchy

    describe('Sharing', () => {
        it('can share a list with other users', async () => {
            // jonathan creates a list
            const createdList = await createTasklist(app, authToken, newList)

            // annie signes up
            const anniesRes = await signup(app, users.annie).expect(201)
            const annie = anniesRes.body.user

            // jonathan shares the list with annie
            await request(app)
                .post(`/list/${createdList.id}/share/${annie.id}`)
                .auth(authToken, typeBearer)
                .expect(201)

            // annie checks if she has access to the list
            await request(app).get(`/list/${createdList.id}`).auth(annie.authToken, typeBearer).expect(200)
        })
        it('cannot access list without it being shared', async () => {
            // jonathan creates a list
            const createdList = await createTasklist(app, authToken, newList)

            // annie signes up
            const anniesRes = await signup(app, users.annie).expect(201)
            const annie = anniesRes.body.user

            // jonathan doesn't share the list with annie

            // annie checks if she has access to the list
            await request(app).get(`/list/${createdList.id}`).auth(annie.authToken, typeBearer).expect(403)
        })
        it.todo('test permissions')
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
