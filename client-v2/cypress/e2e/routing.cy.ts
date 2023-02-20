import {
    signup,
    login,
    typeLoginCredentialsAndSubmit,
    typeSignupCredentialsAndSubmit,
} from 'cypress/support/auth-helpers'
import { testName } from 'cypress/support/helpers'

beforeEach(() => {
    cy.clearDb()
})

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

        it('signing up redirects to the workspace', () => {
            signup()

            cy.get(testName('workspace-page')).should('exist')
        })
        it('logging in redirects to the workspace', () => {
            signup()
            cy.visit('about:blank')

            login()

            cy.get(testName('workspace-page')).should('exist')
        })
    })

    describe('Workspace page', () => {
        it('redirects to /login when visiting /home without valid login', () => {
            cy.visit('/home')
            cy.get(testName('workspace-page')).should('not.exist')
            cy.url().should('contain', '/login')
        })

        it('successful login after redirect, redirects back to /home', () => {
            signup()
            cy.clearLocalStorage()

            cy.visit('/home')
            cy.get(testName('workspace-page')).should('not.exist')
            cy.get(testName('login-page')).should('exist')

            typeLoginCredentialsAndSubmit()

            cy.get(testName('workspace-page')).should('exist')
            cy.url().should('contain', '/home')
        })

        it('can visit with stored token', () => {
            signup()
            cy.get(testName('workspace-page'))
            cy.window().then(() => {
                // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
                const token = window.localStorage.getItem('todo-authToken')!

                cy.clearLocalStorage()

                cy.setLocalStorage('todo-authToken', token)
                cy.visit('/home')

                cy.get(testName('workspace-page')).should('exist')
            })
        })
    })

    describe('Settings page', () => {
        it('redirects to /login when visiting /settings without valid login', () => {
            cy.visit('/settings')
            cy.get(testName('settings-page')).should('not.exist')
            cy.url().should('contain', '/login')
        })
        it('does not redirect when visiting /settings with valid login', () => {
            signup()

            cy.get(testName('user-menu-toggle')).click()
            cy.get(testName('drop-down-menu')).within(() => {
                cy.contains(/Settings/)
                    .closest(testName('menu-item'))
                    .click()
            })

            cy.url().should('contain', '/settings')
            cy.get(testName('settings-page')).should('exist')
        })

        it('successful signup after redirect, redirects back to /settings', () => {
            cy.visit('/settings')

            cy.get(testName('settings-page')).should('not.exist')
            cy.get(testName('login-page')).should('exist')
            cy.get(testName('signup-link')).click()

            cy.get(testName('signup-page')).should('exist')
            typeSignupCredentialsAndSubmit()

            cy.get(testName('settings-page')).should('exist')
            cy.url().should('contain', '/settings')
        })

        it('successful login after redirect, redirects back to /settings', () => {
            signup()
            cy.clearLocalStorage()

            cy.visit('/settings')
            cy.get(testName('settings-page')).should('not.exist')
            cy.get(testName('login-page')).should('exist')

            typeLoginCredentialsAndSubmit()

            cy.get(testName('settings-page')).should('exist')
            cy.url().should('contain', '/settings')
        })
    })

    describe('Not found page', () => {
        it('shows 404 page when visiting an unknown route', () => {
            cy.visit('/non-existant-route')
            cy.get(testName('404-page')).should('exist')
        })
    })
})
