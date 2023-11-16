import { testName } from 'cypress/support/helpers'

beforeEach(() => {
    cy.clearDb()
    cy.signup()
    cy.visit('/home')

    cy.intercept('POST', '/list').as('createList')
    cy.intercept('POST', '/task').as('createTask')

    cy.intercept('PATCH', '/list/*').as('updateList')
    cy.intercept('PATCH', '/task/*').as('updateTask')
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
            cy.wait('@createList').its('response.statusCode').should('equal', 201)

            cy.get(testName('dashboard-page')).should('not.exist')
            cy.get(testName('entity-page')).should('exist')
            cy.get(testName('entity-tree-node')).should('have.length', 1)
            cy.get(testName('entity-tree-node')).should('have.attr', 'data-level', 0)
        })

        describe('Sidebar tree', () => {
            it('can add children', () => {
                cy.get(testName('sidebar-create-new-list')).click()

                cy.get('[data-test-is-loading="false"]') // wait for loading to finish
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

                cy.get('[data-test-is-loading="false"]') // wait for loading to finish
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
                cy.get(testName('editable-entity-name')).get(testName('inline-editor')).focus().type(entityName).blur()
                cy.get(testName('entity-tree-node')).should('contain.text', entityName)
            })

            it('can edit the description', () => {
                cy.get(testName('sidebar-create-new-list')).click()
                cy.get(testName('editable-entity-name'))

                const description = 'The testing entity description'

                cy.get(testName('add-description')).click()
                cy.get(testName('description-editor')).focused().type(description).blur()
                cy.wait('@updateList').its('response.statusCode').should('equal', 200) // we currently don't have any other way to verify if updating the description has succeeded
                // maybe it is not a bad idea to assert on the request, but we could take this a step further and verify that the db record was updated
            })

            it('can add children', () => {
                cy.get(testName('sidebar-create-new-list')).click()
                cy.get(testName('editable-entity-name'))

                cy.get(testName('create-children')).click()
                cy.get(testName('entity-tree-node')).should('have.length', 2)
                cy.get(testName('entity-tree-node')).last().should('have.attr', 'data-level', 1)
            })

            it('can add tasks', () => {
                cy.get(testName('sidebar-create-new-list')).click()
                cy.get(testName('editable-entity-name'))

                cy.get(testName('create-task')).click()
                cy.get(testName('task-tree-node')).should('exist')
                // cy.get(testName('entity-tree-node')).last().should('have.attr', 'data-level', 1)
            })
        })

        const openTaskAsPage = () => {
            cy.get(testName('task-tree-node')).within(() => {
                cy.get(testName('task-menu-button')).click()
            })

            // task menu
            cy.get(testName('drop-down-menu')).within(() => {
                cy.get(testName('menu-item')).contains(/Open/).click()
            })
        }

        describe('Task view', () => {
            beforeEach(() => {
                cy.get(testName('sidebar-create-new-list')).click()
                cy.get(testName('editable-entity-name'))
                cy.get(testName('create-task')).click()
                cy.get(testName('task-tree-node'))

                openTaskAsPage()
            })
            it('can open a task as page', () => {
                cy.contains('Untitled task')
            })

            it('can edit the entity name', () => {
                const entityName = 'The testing entity'

                cy.get(testName('editable-entity-name')).get(testName('inline-editor')).focus().type(entityName).blur()
                cy.get(testName('entity-tree-node')).last().should('contain.text', entityName)
                cy.wait('@updateTask').its('response.statusCode').should('equal', 200)
                // @TODO: assert that task-tree has changed
            })

            it('can edit the description', () => {
                const description = 'The testing entity description'

                cy.get(testName('add-description')).click()
                cy.get(testName('description-editor')).focused().type(description).blur()
                cy.wait('@updateTask').its('response.statusCode').should('equal', 200)
            })

            it('can add tasks', () => {
                cy.get(testName('create-subtask')).click()
                cy.get(testName('task-tree-node')).should('exist')
                cy.wait('@createTask').its('response.statusCode').should('equal', 201)
            })
        })

        describe('Tasks', () => {
            beforeEach(() => {
                cy.get(testName('sidebar-create-new-list')).click()
                cy.get(testName('editable-entity-name'))
                cy.get(testName('create-task')).click()
                cy.get(testName('task-tree-node'))
            })

            it("can update a task's status", () => {
                cy.get(testName('task-tree-node')).within(() => {
                    cy.get(testName(`task-status-button`)).click()
                })
                cy.get(testName('drop-down-menu')).within(() => {
                    cy.get(testName('menu-item')).first().click()
                    cy.wait('@updateTask').its('response.statusCode').should('equal', 200)
                })
            })

            it("can update a task's priority", () => {
                cy.get(testName('task-tree-node')).within(() => {
                    cy.get(testName('task-menu-button')).click()
                })

                // task menu
                cy.get(testName('drop-down-menu')).within(() => {
                    cy.contains(/Priority/)
                        .closest(testName('menu-item'))
                        .focus()
                        .type('{rightArrow}')
                })

                // priority menu
                cy.get(testName('drop-down-menu'))
                    .last()
                    .within(() => {
                        cy.intercept('PATCH', '/task/*').as('updateTask')
                        cy.get(testName('menu-item'))
                            .contains(/Urgent/)
                            .click()
                        cy.wait('@updateTask').its('response.statusCode').should('equal', 200)
                    })
            })

            it('can add a subtask', () => {
                cy.get(testName('task-tree-node')).within(() => {
                    cy.get(testName('task-menu-button')).click()
                })

                // task menu
                cy.get(testName('drop-down-menu')).within(() => {
                    cy.contains(/Subtask/)
                        .closest(testName('menu-item'))
                        .click()
                })

                cy.get(testName('task-tree-node')).should('have.length', 2)
                cy.get(testName('task-tree-node')).last().should('have.attr', 'data-test-node-level', 1)
            })
        })
    })
})
