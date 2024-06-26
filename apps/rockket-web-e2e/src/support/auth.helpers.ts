import { credentials, Credentials } from '../fixtures/user-credentials'
import { testName } from './helpers'

export const typeSignupCredentialsAndSubmit = (creds: Credentials = credentials['jonathan']) => {
    cy.get(testName('input-username')).type(creds.username, { delay: 5 })
    cy.get(testName('input-email')).type(creds.email, { delay: 5 })
    cy.get(testName('input-password')).type(creds.password, { delay: 5 })
    cy.get(testName('input-confirmPassword')).type(creds.password, { delay: 5 })
    cy.get(testName('submit-button')).click()
}
export const signupProcedure = (creds: Credentials = credentials['jonathan']) => {
    cy.visit('/auth/signup')
    cy.get(testName('signup-page'))

    cy.intercept('POST', '/auth/signup').as('signup')
    typeSignupCredentialsAndSubmit(creds)
}

export const typeLoginCredentialsAndSubmit = (creds: Credentials = credentials['jonathan']) => {
    cy.get(testName('input-email')).type(creds.email, { delay: 5 })
    cy.get(testName('input-password')).type(creds.password, { delay: 5 })
    cy.get(testName('submit-button')).click()
}
export const loginProcedure = (creds: Credentials = credentials['jonathan']) => {
    cy.visit('/auth/login')
    cy.get(testName('login-page'))
    cy.intercept('POST', '/auth/login').as('login')
    typeLoginCredentialsAndSubmit(creds)
}
