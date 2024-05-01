/* eslint-disable @nx/enforce-module-boundaries */
import { INestApplication } from '@nestjs/common'
import { PrismaClient, TaskComment, Tasklist, TaskPriority, TaskStatus } from '@prisma/client'
import { createTask, createTasklist, request, signup, typeBearer } from '../utils/requests.e2e-util'
import { userFixtures } from '../fixtures/users.fixture'
import { initApplication } from '../utils/init-app.e2e-util'
import { createListDtoFixture } from '../fixtures/lists.fixture'
import { DbHelper } from '../../../rockket-backend/src/prisma-abstractions/db-helper'
import { EntityEvent, TaskEventType, UpdateTaskResponse } from '@rockket/commons'

// @TODO: look into socket testing https://socket.io/docs/v4/testing/#example-with-jest

const dbHelper = new DbHelper(new PrismaClient(), { cacheTableNames: true })

let app: INestApplication

let authToken: string
let createdList: Tasklist

beforeEach(async () => {
    await dbHelper.clearDb()
    await app?.close()
    app = await initApplication()

    const res = await signup(app, userFixtures.jonathan).expect(201)
    authToken = res.body.user.authToken

    createdList = await createTasklist(app, authToken, createListDtoFixture)
})

describe('Task CRUD (e2e)', () => {
    it('can create a task', async () => {
        const createdTask = await createTask(app, authToken, {
            title: 'This is the task title',
            listId: createdList.id,
        })

        expect(createdTask.title).toBe('This is the task title')
    })

    it('can update a task', async () => {
        const createdTask = await createTask(app, authToken, {
            title: 'This is the task title',
            listId: createdList.id,
        })

        const res = await request(app)
            .patch(`/task/${createdTask.id}`)
            .auth(authToken, typeBearer)
            .send({ description: 'This is a description', title: 'The new, updated title' })
            .expect(200)
        const resBody = res.body as UpdateTaskResponse

        expect(resBody.task.description).toBe('This is a description')
        expect(resBody.task.title).toBe('The new, updated title')
    })

    it('can delete a task', async () => {
        const createdTask = await createTask(app, authToken, {
            title: 'This is the task title',
            listId: createdList.id,
        })

        await request(app).delete(`/task/${createdTask.id}`).auth(authToken, typeBearer).expect(200)
        await request(app).get(`/task/${createdTask.id}`).auth(authToken, typeBearer).expect(404)
    })

    it('can create a subtask', async () => {
        const createdParentTask = await createTask(app, authToken, {
            title: 'This is the task title',
            listId: createdList.id,
        })
        const createdSubTask = await createTask(app, authToken, {
            title: 'This is the task title',
            listId: createdList.id,
            parentTaskId: createdParentTask.id,
        })

        const res = await request(app)
            .get(`/task/${createdParentTask.id}/subtasks`)
            .auth(authToken, typeBearer)

        expect(res.body.length).toEqual(1)
        expect(res.body[0].id).toEqual(createdSubTask.id)
    })

    it('can delete a task with subtasks', async () => {
        const createdParentTask = await createTask(app, authToken, {
            title: 'This is the task title',
            listId: createdList.id,
        })
        const createdSubTask = await createTask(app, authToken, {
            title: 'This is the task title',
            listId: createdList.id,
            parentTaskId: createdParentTask.id,
        })

        await request(app).delete(`/task/${createdParentTask.id}`).auth(authToken, typeBearer).expect(200)

        await request(app).get(`/task/${createdParentTask.id}`).auth(authToken, typeBearer).expect(404)
        await request(app).get(`/task/${createdSubTask.id}`).auth(authToken, typeBearer).expect(404)
    })

    describe('task events', () => {
        it.each([
            [TaskEventType.TitleChanged, { key: 'title', value: 'The updated title' }],
            [TaskEventType.TaskStatusChanged, { key: 'status', value: TaskStatus.IN_PROGRESS }],
            [TaskEventType.TaskPriorityChanged, { key: 'priority', value: TaskPriority.HIGH }],
            [TaskEventType.TaskDeadlineChanged, { key: 'deadline', value: new Date().toISOString() }],
        ])("can trigger a task's %s event", async (eventType, { key, value }) => {
            const createdTask = await createTask(app, authToken, {
                title: 'This is the task title',
                listId: createdList.id,
            })

            await request(app)
                .patch(`/task/${createdTask.id}`)
                .auth(authToken, typeBearer)
                .send({ [key]: value })
                .expect(200)

            const res = await request(app)
                .get(`/task/${createdTask.id}/events`)
                .auth(authToken, typeBearer)
                .expect(200)
            const taskEvents: EntityEvent[] = res.body

            expect(taskEvents.length).toEqual(1)
            expect(taskEvents[0].type).toBe(eventType)
            expect(taskEvents[0].metaData.newValue).toBe(value)
        })

        it('can delete a task that has events', async () => {
            const createdTask = await createTask(app, authToken, {
                title: 'This is the task title',
                listId: createdList.id,
            })

            await request(app)
                .patch(`/task/${createdTask.id}`)
                .auth(authToken, typeBearer)
                .send({ status: TaskStatus.COMPLETED })
                .expect(200)

            await request(app).delete(`/task/${createdTask.id}`).auth(authToken, typeBearer).expect(200)

            await request(app).get(`/task/${createdTask.id}`).auth(authToken, typeBearer).expect(404)
        })
    })

    describe('TaskComments', () => {
        it('can comment on a task', async () => {
            const createdTask = await createTask(app, authToken, {
                title: 'This is the task title',
                listId: createdList.id,
            })

            await request(app)
                .post(`/task/${createdTask.id}/comment`)
                .auth(authToken, typeBearer)
                .send({ text: 'This is the comment text' })
                .expect(201)

            const res = await request(app)
                .get(`/task/${createdTask.id}/comments`)
                .auth(authToken, typeBearer)
                .expect(200)
            const comments: TaskComment[] = res.body

            expect(comments.length).toEqual(1)
            expect(comments[0].text).toEqual('This is the comment text')
        })

        it('can delete a task that has comments', async () => {
            const createdTask = await createTask(app, authToken, {
                title: 'This is the task title',
                listId: createdList.id,
            })

            await request(app)
                .post(`/task/${createdTask.id}/comment`)
                .auth(authToken, typeBearer)
                .send({ text: 'This is the comment text' })
                .expect(201)

            await request(app).delete(`/task/${createdTask.id}`).auth(authToken, typeBearer).expect(200)

            await request(app).get(`/task/${createdTask.id}`).auth(authToken, typeBearer).expect(404)
        })

        it('cannot comment on a task without comment permissions', async () => {
            const annie = (await signup(app, userFixtures.annie)).body.user

            const createdTask = await createTask(app, authToken, {
                title: 'This is the task title',
                listId: createdList.id,
            })

            // Share the list with annie, but only for viewing
            await request(app)
                .post(`/list/${createdList.id}/share/${annie.id}`)
                .auth(authToken, typeBearer)
                .send({ permission: 'View' })
                .expect(201)

            // Annie tries to comment
            await request(app)
                .post(`/task/${createdTask.id}/comment`)
                .auth(annie.authToken, typeBearer)
                .send({ text: 'This is the comment text' })
                .expect(403)

            const res = await request(app)
                .get(`/task/${createdTask.id}/comments`)
                .auth(annie.authToken, typeBearer)
                .expect(200)
            const comments: TaskComment[] = res.body

            expect(comments.length).toEqual(0)
        })

        it('can update a comment', async () => {
            const createdTask = await createTask(app, authToken, {
                title: 'This is the task title',
                listId: createdList.id,
            })

            // Annie comments
            const createRes = await request(app)
                .post(`/task/${createdTask.id}/comment`)
                .auth(authToken, typeBearer)
                .send({ text: 'This is the comment text' })
                .expect(201)
            const comment = createRes.body as TaskComment

            const updateRes = await request(app)
                .patch(`/task/comment/${comment.id}`)
                .auth(authToken, typeBearer)
                .send({ text: 'The new text' })
                .expect(200)

            expect(updateRes.body.text).toEqual('The new text')
        })

        it('can update a comment only as author', async () => {
            const annie = (await signup(app, userFixtures.annie)).body.user

            const createdTask = await createTask(app, authToken, {
                title: 'This is the task title',
                listId: createdList.id,
            })

            // Jonathan shares the list with annie (Edit permissions)
            await request(app)
                .post(`/list/${createdList.id}/share/${annie.id}`)
                .auth(authToken, typeBearer)
                .expect(201)

            // Annie comments
            const res = await request(app)
                .post(`/task/${createdTask.id}/comment`)
                .auth(annie.authToken, typeBearer)
                .send({ text: 'This is the comment text' })
                .expect(201)
            const comment = res.body as TaskComment

            // Jonathan tries to update the comment
            await request(app)
                .patch(`/task/comment/${comment.id}`)
                .auth(authToken, typeBearer)
                .send({ text: 'The new text' })
                .expect(403)
        })

        it('can delete a comment', async () => {
            const createdTask = await createTask(app, authToken, {
                title: 'This is the task title',
                listId: createdList.id,
            })

            const res = await request(app)
                .post(`/task/${createdTask.id}/comment`)
                .auth(authToken, typeBearer)
                .send({ text: 'This is the comment text' })
                .expect(201)
            const comment = res.body as TaskComment

            // Jonathan deletes the comment
            await request(app).delete(`/task/comment/${comment.id}`).auth(authToken, typeBearer).expect(200)
        })

        it('anyone with Manage permissions can delete a comment', async () => {
            const annie = (await signup(app, userFixtures.annie)).body.user

            const createdTask = await createTask(app, authToken, {
                title: 'This is the task title',
                listId: createdList.id,
            })

            // Jonathan shares the list with annie (Edit permissions)
            await request(app)
                .post(`/list/${createdList.id}/share/${annie.id}`)
                .auth(authToken, typeBearer)
                .send({ permission: 'Manage' })
                .expect(201)

            const res = await request(app)
                .post(`/task/${createdTask.id}/comment`)
                .auth(authToken, typeBearer)
                .send({ text: 'This is the comment text' })
                .expect(201)
            const comment = res.body as TaskComment

            // Annie deletes the comment
            await request(app)
                .delete(`/task/comment/${comment.id}`)
                .auth(annie.authToken, typeBearer)
                .expect(200)
        })
    })
})
