describe('App', () => {
    it('can visit the app', () => {
        cy.visit('/')
        cy.get('[data-test-name="app-container"]')
    })
})
