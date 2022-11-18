import { authSuccessResponse } from 'cypress/fixtures/auth-responses'
import { credentials } from 'cypress/fixtures/user-credentials'

const testName = (testName: string) => `[data-test-name="${testName}"]`
describe('Routing', () => {
    it('can visit the app', () => {
        cy.visit('/')
        cy.get(testName('landing-page'))
    })

    describe('Auth pages', () => {
        it('can visit the the login page', () => {
            cy.visit('/')
            cy.get(testName('login-link')).click()
            cy.url().should('contain', '/login')
        })
        it('can visit the the signup page', () => {
            cy.visit('/')
            cy.get(testName('signup-link')).click()
            cy.url().should('contain', '/signup')
        })

        it('can visit the the login page from the signup page', () => {
            cy.visit('/auth/signup')
            cy.get(testName('login-link')).click()
            cy.url().should('contain', '/login')
        })
        it('can visit the the signup page from the login page', () => {
            cy.visit('/auth/login')
            cy.get(testName('signup-link')).click()
            cy.url().should('contain', '/signup')
        })

        it('logging in redirects to the workspace', () => {
            cy.visit('/auth/login')

            cy.intercept('http://localhost:3000/auth/login', authSuccessResponse)
            cy.get(testName('input-email')).type(credentials.jonathan.email)
            cy.get(testName('input-password')).type(credentials.jonathan.password)
            cy.get(testName('submit-button')).click()

            cy.get(testName('workspace-page')).should('exist')
        })
    })

    describe('Workspace page', () => {
        it('redirects to /login when visiting /home without valid login', () => {
            cy.visit('/home')
            cy.get(testName('workspace-page')).should('not.exist')
            cy.url().should('contain', '/login')
        })

        it.skip('successful login after redirect, redirects back to /home', () => {
            // @TODO:
        })

        it.skip('show login loading screen when visting with stored token', () => {
            cy.setLocalStorage('todo-authToken', credentials.jonathan.token)
            cy.visit('/home')

            // cy.intercept({ method: 'GET', path: '/auth/me', hostname: 'localhost', port: 3000 }, authSuccessResponse)
            // cy.intercept('http://localhost:3000/auth/me', authSuccessResponse)
            cy.wait(0)

            cy.get(testName('login-loading-page')).should('exist')
            cy.get(testName('workspace-page')).should('exist')
        })
    })

    describe('Settings page', () => {
        it('redirects to /login when visiting /settings without valid login', () => {
            cy.visit('/settings')
            cy.get(testName('settings-page')).should('not.exist')
            cy.url().should('contain', '/login')
        })

        it.skip('successful login after redirect, redirects back to /settings', () => {
            // @TODO:
        })
    })

    describe('Not found page', () => {
        it('shows 404 page when visiting an unknown route', () => {
            cy.visit('/non-existant-route')
            cy.get(testName('404-page')).should('exist')
        })
    })
})
