import { credentials } from '../fixtures/user-credentials'
import { loginProcedure, signupProcedure } from '../support/auth.helpers'
import { testName } from '../support/helpers'

beforeEach(() => {
    cy.clearDb()
})

describe('Authentication', () => {
    describe('Signup', () => {
        it('can sign up', () => {
            signupProcedure()
            cy.get(testName('user-menu-toggle')).invoke('attr', 'data-logged-in').should('eq', 'true')
        })
        it('cannot signup up with the same email twice', () => {
            cy.signup()
            cy.clearLocalStorage()

            signupProcedure()
            cy.get(testName('signup-page'))
            cy.get(testName('workspace-page')).should('not.exist')
            cy.get(testName('user-menu-toggle')).should('not.exist')
        })
    })

    describe('Login', () => {
        it('can login', () => {
            // @TODO: there's sth wrong here, fix it
            // this should not be necessary, but somehow a previous `signup` call from within `beforeEach` prevents the following signup
            // cy.clearDb()

            cy.signup()
            cy.clearLocalStorage()

            loginProcedure()
            cy.get(testName('user-menu-toggle')).invoke('attr', 'data-logged-in').should('eq', 'true')
        })
        it('cannot login with the wrong email', () => {
            cy.signup()
            cy.clearLocalStorage()

            loginProcedure({ ...credentials['jonathan'], email: 'some.other@email.com' })
            cy.get(testName('workspace-page')).should('not.exist')
            cy.get(testName('user-menu-toggle')).should('not.exist')
        })
        it('cannot login with the wrong password', () => {
            cy.signup()
            cy.clearLocalStorage()

            loginProcedure({ ...credentials['jonathan'], password: 'someOtherPwd-123' })
            cy.get(testName('workspace-page')).should('not.exist')
            cy.get(testName('user-menu-toggle')).should('not.exist')
        })
    })
})
