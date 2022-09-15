describe('App', () => {
    it('can visit the app', () => {
        cy.visit('/')
        cy.contains('app is running!')
    })
})
