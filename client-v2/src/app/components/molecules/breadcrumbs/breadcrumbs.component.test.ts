import { CdkMenuModule } from '@angular/cdk/menu'
import { testName } from 'cypress/support/helpers'
import { EntityPageLabelComponent } from '../../atoms/entity-page-label/entity-page-label.component'
import { IconsModule } from '../../atoms/icons/icons.module'
import { DropDownComponent, MenuItem } from '../drop-down/drop-down.component'
import { Breadcrumb, BreadcrumbsComponent } from './breadcrumbs.component'
import { OverlayModule } from '@angular/cdk/overlay'
import { DeviceService } from 'src/app/services/device.service'
import { TooltipComponent } from '../../atoms/tooltip/tooltip.component'

const defaultTemplate = `<app-breadcrumbs [breadcrumbs]="breadcrumbs"></app-breadcrumbs>`
const setupComponent = (breadcrumbs: Breadcrumb[], template = defaultTemplate) => {
    cy.mount(template, {
        componentProperties: {
            breadcrumbs,
        },
        imports: [CdkMenuModule, IconsModule, OverlayModule],
        declarations: [BreadcrumbsComponent, EntityPageLabelComponent, DropDownComponent, TooltipComponent],
        providers: [DeviceService],
    })
}

describe('BreadcrumbsComponent', () => {
    it('displays given breadcrumbs', () => {
        cy.viewport('macbook-13')
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
        cy.viewport('macbook-13')
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

    describe('Truncation', () => {
        const menuItems: MenuItem[] = [{ title: 'test' }]
        const breadcrumbs: Breadcrumb[] = [
            { title: 'Root list', icon: 'workspace', route: '/', contextMenuItems: menuItems },
            { title: '1. Nested list', icon: 'workspace', route: '/ne', contextMenuItems: menuItems },
            { title: '2. Nested list', icon: 'workspace', route: '/ne/ne', contextMenuItems: menuItems },
            { title: '3. Nested list', icon: 'workspace', route: '/ne/ne/ne', contextMenuItems: menuItems },
            { title: '4. Nested list', icon: 'workspace', route: '/ne/ne/ne/ne', contextMenuItems: menuItems },
            { title: '5. Nested list', icon: 'workspace', route: '/ne/ne/ne/ne/ne', contextMenuItems: menuItems },
            { title: '6. Nested list', icon: 'workspace', route: '/ne/ne/ne/ne/ne/ne', contextMenuItems: menuItems },
        ]

        it('truncates breadcrumbs on desktop', () => {
            cy.viewport('macbook-13')

            setupComponent(breadcrumbs)

            cy.get(testName('breadcrumb')).should('have.length', 4)
            cy.get(testName('truncation-breadcrumb')).should('exist')
        })

        it('truncates breadcrumbs on mobile', () => {
            setupComponent(breadcrumbs)

            cy.get(testName('breadcrumb')).should('have.length', 1)
            cy.get(testName('truncation-breadcrumb')).should('exist')
        })

        it('can show the truncated breadcrumbs', () => {
            setupComponent(breadcrumbs)

            cy.get(testName('truncation-breadcrumb')).click()
            cy.get(testName('truncated-breadcrumbs-container')).within(() => {
                cy.get(testName('breadcrumb')).should('have.length', 6)
            })
        })

        it('can access context menu', () => {
            setupComponent(breadcrumbs)

            cy.get(testName('truncation-breadcrumb')).click()
            cy.get(testName('truncated-breadcrumbs-container')).within(() => {
                cy.get(testName('breadcrumb')).first().rightclick()
            })
            cy.get(testName('drop-down-menu')).should('exist')
        })
    })
})
