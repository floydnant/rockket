describe('App', () => {
    it('can visit the app', () => {
        cy.visit('/')
        cy.contains('app is running!')
    })
    it('displays the current app version', () => {
        cy.visit('/')
        cy.contains('2.0.0')
    })
})
