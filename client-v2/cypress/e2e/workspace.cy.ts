import { signup } from 'cypress/support/auth-helpers'
import { testName } from 'cypress/support/helpers'

beforeEach(() => {
    cy.clearDb()
    signup()

    cy.intercept('POST', '/list').as('createEntity')
})

describe('Workspace', () => {
    it('opens dashboard', () => {
        cy.get(testName('dashboard-page')).should('exist')
        cy.get(testName('entity-page')).should('not.exist')
    })

    describe('Sidebar entity tree', () => {
        it.skip('should display the tree')

        it('can add entities', () => {
            cy.get(testName('entity-tree-node')).should('have.length', 0)
            cy.get(testName('sidebar-create-new-list')).click()
            cy.wait('@createEntity').its('response.statusCode').should('equal', 201)

            cy.get(testName('dashboard-page')).should('not.exist')
            cy.get(testName('entity-page')).should('exist')
            cy.get(testName('entity-tree-node')).should('have.length', 1)
            cy.get(testName('entity-tree-node')).should('have.attr', 'data-level', 0)
        })

        describe('Tree nodes', () => {
            it('can add children', () => {
                cy.get(testName('sidebar-create-new-list')).click()

                cy.get(testName('entity-tree-node'))
                    .first()
                    .focus()
                    .within(() => {
                        cy.get(testName('create-child')).click()
                    })
                cy.get(testName('entity-tree-node')).should('have.length', 2)
                cy.get(testName('entity-tree-node')).last().should('have.attr', 'data-level', 1)
            })

            it('can open the options menu', () => {
                cy.get(testName('sidebar-create-new-list')).click()

                cy.get(testName('entity-tree-node'))
                    .first()
                    .focus()
                    .within(() => {
                        cy.get(testName('open-menu')).click()
                    })

                cy.get(testName('drop-down-menu')).should('exist')
            })
        })
    })

    describe('Entity page', () => {
        describe('Tasklist view', () => {
            it('can edit the entity name', () => {
                cy.get(testName('sidebar-create-new-list')).click()

                const entityName = 'The testing entity'
                cy.get(testName('editable-entity-name')).focus().type(entityName)
                cy.get(testName('entity-tree-node')).should('contain.text', entityName)
            })

            it('can edit the description', () => {
                cy.get(testName('sidebar-create-new-list')).click()

                cy.intercept('PATCH', '/list/*').as('updateEntity')
                const description = 'The testing entity description'

                cy.get(testName('add-description')).click()
                cy.get(testName('description-editor')).type(description).blur()
                cy.wait('@updateEntity').its('response.statusCode').should('equal', 200) // we currently don't have any other way to verify if updating the description has succeeded
            })

            it('can add children', () => {
                cy.get(testName('sidebar-create-new-list')).click()

                cy.get(testName('create-children')).click()
                cy.get(testName('entity-tree-node')).should('have.length', 2)
                cy.get(testName('entity-tree-node')).last().should('have.attr', 'data-level', 1)
            })
        })
    })
})
