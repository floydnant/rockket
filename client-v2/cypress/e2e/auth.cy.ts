import { credentials } from 'cypress/fixtures/user-credentials'
import { login, signup } from 'cypress/support/auth-helpers'
import { testName } from 'cypress/support/helpers'

beforeEach(() => {
    cy.clearDb()
})

describe('Authentication', () => {
    describe('Signup', () => {
        it('can sign up', () => {
            signup()
            cy.get(testName('user-menu-toggle')).invoke('attr', 'data-logged-in').should('eq', 'true')
        })
        it('cannot signup up with the same email twice', () => {
            signup()
            cy.visit('about:blank')

            signup()
            cy.get(testName('signup-page'))
            cy.get(testName('workspace-page')).should('not.exist')
            cy.get(testName('user-menu-toggle')).should('not.exist')
        })
    })

    describe('Login', () => {
        it('can login', () => {
            signup()
            cy.visit('about:blank')

            login()
            cy.get(testName('user-menu-toggle')).invoke('attr', 'data-logged-in').should('eq', 'true')
        })
        it('cannot login with the wrong email', () => {
            signup()
            cy.visit('about:blank')

            login({ ...credentials['jonathan'], email: 'some.other@email.com' })
            cy.get(testName('workspace-page')).should('not.exist')
            cy.get(testName('user-menu-toggle')).should('not.exist')
        })
        it('cannot login with the wrong password', () => {
            signup()
            cy.visit('about:blank')

            login({ ...credentials['jonathan'], password: 'someOtherPwd-123' })
            cy.get(testName('workspace-page')).should('not.exist')
            cy.get(testName('user-menu-toggle')).should('not.exist')
        })
    })
})
