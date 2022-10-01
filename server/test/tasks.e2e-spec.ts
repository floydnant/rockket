import { INestApplication } from '@nestjs/common'
import { PrismaClient, Task, TaskEvent, Tasklist } from '@prisma/client'
import { DbHelper } from './db-helper'
import { newList, users } from './fixtures'
import { createTask, createTasklist, initApplication, request, signup, typeBearer } from './testing-utils'

const dbHelper = new DbHelper(new PrismaClient(), { cacheTableNames: true })

// @TODO: look into socket testing https://socket.io/docs/v4/testing/#example-with-jest

let app: INestApplication
let authToken: string

beforeEach(async () => {
    await dbHelper.clearDb()
    app = await initApplication()

    const res = await signup(app, users.jonathan).expect(201)
    authToken = res.body.user.authToken
})

let createdList: Tasklist
beforeEach(async () => {
    createdList = await createTasklist(app, authToken, newList)
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

        expect(res.body.description).toBe('This is a description')
        expect(res.body.title).toBe('The new, updated title')
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
    it.todo('test permissions')

    it.todo('test blocking tasks')

    describe('TaskEvents', () => {
        it.each([
            ['status', 'In_Progress'],
            ['priority', 'High'],
            ['deadline', new Date().toISOString()],
        ])("can update a task's %s -> verify task event", async (key, value) => {
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
            const taskEvents: TaskEvent[] = res.body

            expect(taskEvents.length).toEqual(1)
            expect(taskEvents[0].updatedField).toBe(key)
            expect(taskEvents[0].newValue).toBe(value)
        })
    })

    it.todo('test TaskComments')
})
