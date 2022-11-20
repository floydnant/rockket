import { INestApplication } from '@nestjs/common'
import { PrismaClient } from '@prisma/client'
import { DbHelper } from '../src/prisma-abstractions/db-helper'
import { users } from './fixtures'
import { signup, login, request, typeBearer, initApplication } from './testing-utils'

const dbHelper = new DbHelper(new PrismaClient(), { cacheTableNames: true })

describe('Authentication (e2e)', () => {
    let app: INestApplication

    beforeEach(async () => {
        await dbHelper.clearDb()
        app = await initApplication()
    })

    // @TODO: all these tests are just validating the `statusCode`, maybe its a good idea to validate the bodies as well
    // @TODO: we also dont check if the database has actually been updated correctly

    // const SuccessResponse = { successMessage: /\w+/ }
    // const AuthSuccessResponse = {
    //     ...SuccessResponse,
    //     user: { id: /.+/, username: /\w/, authToken: /.+/ },
    // }
    // const ErrorResponse = {
    //     statusCode: /\d+/,
    //     message: /.+/,
    //     error: /\w+/,
    // }

    describe('Sign up', () => {
        it('can sign up', () => {
            return signup(app, users.jonathan).expect(201)
        })
        it('cannot sign up with same email twice', async () => {
            await signup(app, users.jonathan).expect(201)
            await signup(app, users.jonathan).expect(409)
        })
        it.todo('complains about insecure passwords')
    })

    describe('Login', () => {
        beforeEach(async () => await signup(app, users.jonathan).expect(201))

        it('can login', async () => {
            await login(app, users.jonathan).expect(201)
        })
        it('cannot login with wrong email', async () => {
            await login(app, { ...users.jonathan, email: 'This is wrong' }).expect(401)
        })
        it('cannot login with wrong password', async () => {
            // @TODO: this seems to return 500 for some reason when not using spread operator
            await login(app, { ...users.jonathan, password: 'This is wrong' }).expect(401)
        })
    })

    describe('Renew Login', () => {
        it('can renew authToken', async () => {
            const res = await signup(app, users.jonathan).expect(201)
            const authToken = res.body.user.authToken

            await request(app).get('/auth/me').auth(authToken, typeBearer).expect(200)
        })
    })

    describe('Managing account data', () => {
        let authToken: string
        beforeEach(async () => {
            const res = await signup(app, users.jonathan).expect(201)
            authToken = res.body.user.authToken
        })

        describe('Username', () => {
            it('can change username', async () => {
                await request(app)
                    .patch('/user')
                    .auth(authToken, typeBearer)
                    .send({ username: 'Bob Vance from Vance Refrigeration' })
                    .expect(200)
            })
        })

        describe('Email', () => {
            it('can change email', async () => {
                await request(app)
                    .patch('/user/email')
                    .auth(authToken, typeBearer)
                    .send({ password: users.jonathan.password, email: 'new-email@example.com' })
                    .expect(200)
            })
            it('cannot change email with wrong credentials', async () => {
                await request(app)
                    .patch('/user/email')
                    .auth(authToken, typeBearer)
                    .send({ password: 'Wrong password', email: 'new-email@example.com' })
                    .expect(401)
            })
            it.todo('cannot change to an already existing email')
        })

        describe('Password', () => {
            it('can change password', async () => {
                await request(app)
                    .patch('/user/password')
                    .auth(authToken, typeBearer)
                    .send({ password: users.jonathan.password, newPassword: 'My new password' })
                    .expect(200)
            })
            it('cannot change password with wrong credentials', async () => {
                await request(app)
                    .patch('/user/password')
                    .auth(authToken, typeBearer)
                    .send({ password: 'Wrong password', newPassword: 'My new password' })
                    .expect(401)
            })
        })

        describe('Delete Account', () => {
            it('can delete account', async () => {
                await request(app)
                    .delete('/user')
                    .auth(authToken, typeBearer)
                    .send({ password: users.jonathan.password })
                    .expect(200)
            })
            it('cannot delete account with wrong credentials', async () => {
                await request(app)
                    .delete('/user')
                    .auth(authToken, typeBearer)
                    .send({ password: 'Wrong password' })
                    .expect(401)
            })
        })
    })
})
