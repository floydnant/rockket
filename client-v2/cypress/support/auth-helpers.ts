import { credentials, Credentials } from 'cypress/fixtures/user-credentials'
import { testName } from './helpers'

export const typeSignupCredentialsAndSubmit = (creds: Credentials = credentials['jonathan']) => {
    cy.get(testName('input-username')).type(creds.username)
    cy.get(testName('input-email')).type(creds.email)
    cy.get(testName('input-password')).type(creds.password)
    cy.get(testName('input-confirmPassword')).type(creds.password)
    cy.get(testName('submit-button')).click()
}
export const signup = (creds: Credentials = credentials['jonathan']) => {
    cy.visit('/auth/signup')
    cy.get(testName('signup-page'))
    typeSignupCredentialsAndSubmit(creds)
}

export const typeLoginCredentialsAndSubmit = (creds: Credentials = credentials['jonathan']) => {
    cy.get(testName('input-email')).type(creds.email)
    cy.get(testName('input-password')).type(creds.password)
    cy.get(testName('submit-button')).click()
}
export const login = (creds: Credentials = credentials['jonathan']) => {
    cy.visit('/auth/login')
    cy.get(testName('login-page'))
    typeLoginCredentialsAndSubmit(creds)
}
