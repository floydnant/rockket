import { INestApplication } from '@nestjs/common'
import { PrismaClient, Tasklist, TaskStatus } from '@prisma/client'
import { UpdateTasklistDto } from '../src/entities/list/list.dto'
import { DbHelper } from '../src/prisma-abstractions/db-helper'
import { newList, users } from './fixtures'
import { initApplication, signup, createTasklist, typeBearer, request, createTask } from './testing-utils'

const dbHelper = new DbHelper(new PrismaClient(), { cacheTableNames: true })

let app: INestApplication
let authToken: string

beforeEach(async () => {
    await dbHelper.clearDb()
    app = await initApplication()

    const res = await signup(app, users.jonathan).expect(201)
    authToken = res.body.user.authToken
})

describe('List CRUD (e2e)', () => {
    it('can create a tasklist', async () => {
        const createdList: Tasklist = await createTasklist(app, authToken, newList)
        expect(createdList.title).toEqual(newList.title)
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

    describe('Deletion', () => {
        it('can delete a list', async () => {
            const createdList: Tasklist = await createTasklist(app, authToken, newList)

            // @TODO: test for list participants
            await request(app).delete(`/list/${createdList.id}`).auth(authToken, typeBearer).expect(200)

            await request(app).get(`/list/${createdList.id}`).auth(authToken, typeBearer).expect(404)
        })

        it('can delete a list with tasks in it', async () => {
            const createdList: Tasklist = await createTasklist(app, authToken, newList)
            const createdTask = await createTask(app, authToken, {
                title: 'This is the task title',
                listId: createdList.id,
            })
            // updating a task, will create a `TaskEvent` which needs to be deleted as well
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
            const createdList1: Tasklist = await createTasklist(app, authToken, newList)
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
        const createdList = await createTasklist(app, authToken, newList)
        await createTasklist(app, authToken, {
            ...newList,
            parentListId: createdList.id,
        })

        const res = await request(app).get(`/list/${createdList.id}`).auth(authToken, typeBearer).expect(200)
        expect(res.body.childLists.length).toEqual(1)
    })

    it.todo('test moving lists around the hierarchy')

    describe('Sharing (participants)', () => {
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
        describe('Permissions', () => {
            it('cannot access a tasklist without permissions', async () => {
                // jonathan creates a list
                const createdList = await createTasklist(app, authToken, newList)

                // annie signes up
                const anniesRes = await signup(app, users.annie).expect(201)
                const annie = anniesRes.body.user

                // jonathan doesn't share the list with annie

                // annie checks if she has access to the list
                await request(app)
                    .get(`/list/${createdList.id}`)
                    .auth(annie.authToken, typeBearer)
                    .expect(403)
            })

            it('cannot edit a tasklist without Edit permissions', async () => {
                // jonathan creates a list
                const createdList = await createTasklist(app, authToken, newList)

                // annie signes up
                const annie = (await signup(app, users.annie).expect(201)).body.user

                // jonathan shares the list with annie
                await request(app)
                    .post(`/list/${createdList.id}/share/${annie.id}`)
                    .auth(authToken, typeBearer)
                    .send({ permission: 'View' })
                    .expect(201)

                // annie checks if she can edit the list
                await request(app)
                    .patch(`/list/${createdList.id}`)
                    .auth(annie.authToken, typeBearer)
                    .send({ title: 'New list title' })
                    .expect(403)
            })
        })
    })
})
