import { CdkMenuModule } from '@angular/cdk/menu'
import { testName } from 'cypress/support/helpers'
import { EntityPageLabelComponent } from '../../atoms/entity-page-label/entity-page-label.component'
import { IconsModule } from '../../atoms/icons/icons.module'
import { DropDownComponent, MenuItem } from '../drop-down/drop-down.component'
import { Breadcrumb, BreadcrumbsComponent } from './breadcrumbs.component'

const defaultTemplate = `<app-breadcrumbs [breadcrumbs]="breadcrumbs"></app-breadcrumbs>`
const setupComponent = (breadcrumbs: Breadcrumb[], template = defaultTemplate) => {
    cy.mount(template, {
        componentProperties: {
            breadcrumbs,
        },
        imports: [CdkMenuModule, IconsModule],
        declarations: [BreadcrumbsComponent, EntityPageLabelComponent, DropDownComponent],
    })
}

describe('BreadcrumbsComponent', () => {
    it('displays given breadcrumbs', () => {
        const breadcrumbs: Breadcrumb[] = [
            { title: 'Root list', icon: 'workspace', route: '/' },
            { title: 'Nested list', icon: 'workspace', route: '/nested' },
            { title: 'Nested list', icon: 'workspace', route: '/nested/nested' },
        ]
        setupComponent(breadcrumbs)

        cy.get(testName('breadcrumb')).should('have.length', 3)
        cy.get(testName('breadcrumbs-container')).should('have.text', breadcrumbs.map(({ title }) => title).join('/'))
    })

    // @TODO: Navigation through clicking a breadcrumb must be tested in e2e

    it('can open a context menu', () => {
        const menuItems: MenuItem[] = [{ title: 'test' }]
        const breadcrumbs: Breadcrumb[] = [
            { title: 'Root list', icon: 'workspace', route: '/', contextMenuItems: menuItems },
            { title: 'Nested list', icon: 'workspace', route: '/nested', contextMenuItems: menuItems },
            { title: 'Nested list', icon: 'workspace', route: '/nested/nested', contextMenuItems: menuItems },
        ]
        setupComponent(breadcrumbs)

        cy.get(testName('drop-down-menu')).should('not.exist')
        cy.get(testName('breadcrumb')).first().rightclick()
        cy.get(testName('drop-down-menu')).should('exist')
    })
})
