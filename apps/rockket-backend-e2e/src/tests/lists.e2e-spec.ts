/* eslint-disable @nx/enforce-module-boundaries */
import { INestApplication } from '@nestjs/common'
import { PrismaClient, Tasklist, TaskStatus } from '@prisma/client'
import { UpdateTasklistDto } from '../../../rockket-backend/src/entities/list/list.dto'
import { createTask, createTasklist, request, signup, typeBearer } from '../utils/requests.e2e-util'
import { userFixtures } from '../fixtures/users.fixture'
import { initApplication } from '../utils/init-app.e2e-util'
import { createListDtoFixture } from '../fixtures/lists.fixture'
import { DbHelper } from 'apps/rockket-backend/src/prisma-abstractions/db-helper'

const dbHelper = new DbHelper(new PrismaClient(), { cacheTableNames: true })

let app: INestApplication
let authToken: string

beforeEach(async () => {
    await dbHelper.clearDb()
    await app?.close()
    app = await initApplication()

    const res = await signup(app, userFixtures.jonathan).expect(201)
    authToken = res.body.user.authToken
})

describe('List CRUD (e2e)', () => {
    it('can create a tasklist', async () => {
        const createdList: Tasklist = await createTasklist(app, authToken, createListDtoFixture)
        expect(createdList.title).toEqual(createListDtoFixture.title)
    })
    it('can update a tasklist', async () => {
        const createdList = await createTasklist(app, authToken, createListDtoFixture)

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

    describe('Deletion', () => {
        it('can delete a list', async () => {
            const createdList: Tasklist = await createTasklist(app, authToken, createListDtoFixture)

            // @TODO: test for list participants
            await request(app).delete(`/list/${createdList.id}`).auth(authToken, typeBearer).expect(200)

            await request(app).get(`/list/${createdList.id}`).auth(authToken, typeBearer).expect(404)
        })

        it('can delete a list with tasks in it', async () => {
            const createdList: Tasklist = await createTasklist(app, authToken, createListDtoFixture)
            const createdTask = await createTask(app, authToken, {
                title: 'This is the task title',
                listId: createdList.id,
            })
            // Updating a task, will create a `TaskEvent` which needs to be deleted as well
            await request(app)
                .patch(`/task/${createdTask.id}`)
                .send({ status: TaskStatus.Completed })
                .auth(authToken, typeBearer)
                .expect(200)
            // @TODO: test for task comments

            await request(app).delete(`/list/${createdList.id}`).auth(authToken, typeBearer).expect(200)

            await request(app).get(`/list/${createdList.id}`).auth(authToken, typeBearer).expect(404)
            await request(app).get(`/task/${createdTask.id}`).auth(authToken, typeBearer).expect(404)
        })

        it('can delete a list with lists and tasks in it', async () => {
            const createdList1: Tasklist = await createTasklist(app, authToken, createListDtoFixture)
            const createdList2: Tasklist = await createTasklist(app, authToken, {
                title: 'new List',
                parentListId: createdList1.id,
            })
            const createdTask = await createTask(app, authToken, {
                title: 'This is the task title',
                listId: createdList2.id,
            })

            await request(app).delete(`/list/${createdList1.id}`).auth(authToken, typeBearer).expect(200)

            await request(app).get(`/list/${createdList1.id}`).auth(authToken, typeBearer).expect(404)
            await request(app).get(`/list/${createdList2.id}`).auth(authToken, typeBearer).expect(404)
            await request(app).get(`/task/${createdTask.id}`).auth(authToken, typeBearer).expect(404)
        })
    })

    it('can add a child-tasklist', async () => {
        const createdList = await createTasklist(app, authToken, createListDtoFixture)
        await createTasklist(app, authToken, {
            ...createListDtoFixture,
            parentListId: createdList.id,
        })

        const res = await request(app).get(`/list/${createdList.id}`).auth(authToken, typeBearer).expect(200)
        expect(res.body.childLists.length).toEqual(1)
    })

    it.todo('test moving lists around the hierarchy')

    describe('Sharing (participants)', () => {
        it('can share a list with other users', async () => {
            // Jonathan creates a list
            const createdList = await createTasklist(app, authToken, createListDtoFixture)

            // Annie signes up
            const anniesRes = await signup(app, userFixtures.annie).expect(201)
            const annie = anniesRes.body.user

            // Jonathan shares the list with annie
            await request(app)
                .post(`/list/${createdList.id}/share/${annie.id}`)
                .auth(authToken, typeBearer)
                .expect(201)

            // Annie checks if she has access to the list
            await request(app).get(`/list/${createdList.id}`).auth(annie.authToken, typeBearer).expect(200)
        })
        describe('Permissions', () => {
            it('cannot access a tasklist without permissions', async () => {
                // Jonathan creates a list
                const createdList = await createTasklist(app, authToken, createListDtoFixture)

                // Annie signes up
                const anniesRes = await signup(app, userFixtures.annie).expect(201)
                const annie = anniesRes.body.user

                // Jonathan doesn't share the list with annie

                // annie checks if she has access to the list
                await request(app)
                    .get(`/list/${createdList.id}`)
                    .auth(annie.authToken, typeBearer)
                    .expect(403)
            })

            it('cannot edit a tasklist without Edit permissions', async () => {
                // Jonathan creates a list
                const createdList = await createTasklist(app, authToken, createListDtoFixture)

                // Annie signes up
                const annie = (await signup(app, userFixtures.annie).expect(201)).body.user

                // Jonathan shares the list with annie
                await request(app)
                    .post(`/list/${createdList.id}/share/${annie.id}`)
                    .auth(authToken, typeBearer)
                    .send({ permission: 'View' })
                    .expect(201)

                // Annie checks if she can edit the list
                await request(app)
                    .patch(`/list/${createdList.id}`)
                    .auth(annie.authToken, typeBearer)
                    .send({ title: 'New list title' })
                    .expect(403)
            })
        })
    })
})
