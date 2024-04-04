// ***********************************************
// This example commands.js shows you how to
// create various custom commands and overwrite
// existing commands.
//
// For more comprehensive examples of custom
// commands please read more here:
// https://on.cypress.io/custom-commands
// ***********************************************

// eslint-disable-next-line @typescript-eslint/no-namespace
declare namespace Cypress {
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    interface Chainable<Subject> {
        setLocalStorage: typeof setLocalStorage
        clearDb: typeof clearDb
        signup: typeof signup
    }
}

function setLocalStorage(itemName: string, itemValue: string) {
    // Cy.visit('/')
    return cy.window().then(() => {
        window.localStorage.setItem(itemName, itemValue)
    })
}
Cypress.Commands.add('setLocalStorage', setLocalStorage)

function clearDb() {
    cy.request('http://localhost:3001/clear-db')
        .as('clearDb')
        .then(res => {
            expect(res.status).to.eq(200)
        })
}
Cypress.Commands.add('clearDb', clearDb)

function signup() {
    const signupDto = {
        email: 'jonathan.butler@cy.com',
        username: 'Jonathan Butler',
        password: 'Password-123',
    }
    cy.request({ method: 'POST', url: 'http://localhost:3001/auth/signup', body: signupDto })
        .as('shadow-signup')
        .then(res => {
            expect(res.status).to.eq(201)

            // Token needs to be JSON parsable
            cy.setLocalStorage('rockket-auth-token', `${JSON.stringify(res.body.user.authToken)}`)
        })
}
Cypress.Commands.add('signup', signup)

//
// -- This is a child command --
// Cypress.Commands.add("drag", { prevSubject: 'element'}, (subject, options) => { ... })
//
//
// -- This is a dual command --
// Cypress.Commands.add("dismiss", { prevSubject: 'optional'}, (subject, options) => { ... })
//
//
// -- This will overwrite an existing command --
// Cypress.Commands.overwrite("visit", (originalFn, url, options) => { ... })
