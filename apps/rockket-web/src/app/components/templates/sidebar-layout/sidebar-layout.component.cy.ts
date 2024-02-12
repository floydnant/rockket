import { CdkMenuModule } from '@angular/cdk/menu'
import { OverlayModule } from '@angular/cdk/overlay'
import { testName } from 'cypress/support/helpers'
import { UiStateService } from 'src/app/services/ui-state.service'
import { actionsMock, storeMock } from 'src/app/utils/unit-test.mocks'
import { IconComponent } from '../../atoms/icons/icon/icon.component'
import { LoadingSpinnerComponent } from '../../atoms/icons/loading-spinner/loading-spinner.component'
import { UserMenuComponent } from '../../organisms/user-menu/user-menu.component'
import { MainPaneComponent } from '../main-pane/main-pane.component'
import { MenuToggleComponent } from './menu-toggle/menu-toggle.component'
import { SidebarLayoutComponent } from './sidebar-layout.component'

const setupComponent = (template: string) => {
    cy.mount(template, {
        componentProperties: {},
        providers: [storeMock, UiStateService, actionsMock],
        imports: [OverlayModule, CdkMenuModule],
        declarations: [
            SidebarLayoutComponent,
            UserMenuComponent,
            LoadingSpinnerComponent,
            IconComponent,
            MainPaneComponent,
            MenuToggleComponent,
        ],
    })
}

const defaultContent = `
    <ng-container sidebarHeader>sidebar header</ng-container>
    <ng-container sidebarContent>${Array(30)
        .fill('')
        .map(() => '<p>sidebar content</p>')
        .join('')}</ng-container>

    <app-main-pane>
        <ng-container header>
            Header
            <app-menu-toggle index="1"></app-menu-toggle>
        </ng-container>
        <ng-container main>
        ${Array(30)
            .fill('')
            .map(() => '<p>main content</p>')
            .join('')}
        </ng-container>
    </app-main-pane>
`
const defaultTemplate = `<app-sidebar-layout> ${defaultContent} </app-sidebar-layout>`

describe('SidebarLayoutComponent', () => {
    it('renders properly', () => {
        cy.viewport('macbook-13')
        setupComponent(defaultTemplate)

        cy.get(testName('sidebar'))
        cy.get(testName('sidebar-header')).contains('sidebar header')
        cy.get(testName('sidebar-content')).contains('sidebar content')
        cy.get(testName('main-pane'))
        cy.get(testName('main-header')).contains('Header')
        cy.get(testName('main-content')).contains('main content')
    })

    describe('Collapasing sidebar/menu', () => {
        it('can open and close the menu on mobile', () => {
            cy.viewport('iphone-se2')
            setupComponent(defaultTemplate)

            // Open by default
            cy.get(testName('sidebar')).should('not.have.attr', 'hidden')

            // Then close it
            cy.get(testName('menu-toggle-2')).click()
            cy.get(testName('sidebar')).should('have.attr', 'hidden')

            // Then open again
            cy.get(testName('menu-toggle-1')).click()
            cy.get(testName('sidebar')).should('not.have.attr', 'hidden')
        })
    })

    describe('Resizing', () => {
        it('can resize the sidebar', () => {
            cy.viewport('macbook-13')
            setupComponent(defaultTemplate)

            cy.get(testName('resize-handle'))
                .trigger('mousedown')
                .trigger('mousemove', { clientX: 350, force: true })
                .trigger('mouseup')

            cy.get(testName('sidebar')).then(e => expect(e.width()).greaterThan(348))

            cy.get(testName('resize-handle'))
                .trigger('mousedown')
                .trigger('mousemove', { clientX: 170, force: true })
                .trigger('mouseup')

            cy.get(testName('sidebar')).then(e => expect(e.width()).lessThan(171))
        })

        it('cannot resize the sidebar when resizing disabled', () => {
            cy.viewport('macbook-13')
            setupComponent(
                `<app-sidebar-layout [enableResize]="false"> ${defaultContent} </app-sidebar-layout>`,
            )

            cy.get(testName('resize-handle')).should('not.exist')
        })
    })
})
