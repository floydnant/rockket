import { CdkMenuModule } from '@angular/cdk/menu'
import { OverlayModule } from '@angular/cdk/overlay'
import { testName } from 'cypress/support/helpers'
import { DropDownComponent, MenuItem, MenuItemVariant } from './drop-down.component'

const getMenuItems = (logoutAction: MenuItem['action'] = () => ''): MenuItem[] => [
    {
        title: 'Workspace',
        route: '/home',
    },
    {
        title: 'Settings',
        route: '/settings',
        children: [
            { title: 'General', route: '/settings/general' },
            { title: 'Account', route: '/settings/account' },
            { title: 'Appearance', route: '/settings/appearance' },
        ],
    },
    { isSeperator: true },
    { title: 'Logout', action: logoutAction, variant: MenuItemVariant.DANGER },
]

const defaultTemplate = `
    <button
        [cdkMenuTriggerFor]="menu"
        #menuTrigger="cdkMenuTriggerFor"
    >
        This is a drop down trigger
    </button>

    <ng-template #menu>
        <app-drop-down [items]="menuItems" [rootTrigger]="menuTrigger"></app-drop-down>
    </ng-template>
`

const setupComponent = (template = defaultTemplate, menuItems = getMenuItems()) => {
    cy.mount(template, {
        componentProperties: {
            menuItems,
        },
        imports: [OverlayModule, CdkMenuModule],
        declarations: [DropDownComponent],
    })
}

describe('DropDownComponent', () => {
    it('is hidden by default', () => {
        setupComponent()
        cy.get('button')
        cy.get(testName('drop-down-menu')).should('not.exist')
    })

    it('renders menu on trigger click', () => {
        setupComponent()
        cy.get('button').click()
        cy.get(testName('drop-down-menu'))
    })

    it('closes menu on item click', () => {
        setupComponent()
        cy.get('button').click()
        cy.get(testName('drop-down-menu'))

        cy.get(testName('menu-item')).first().click()
        cy.get(testName('drop-down-menu')).should('not.exist')
    })

    it('closes menu on nested item click', () => {
        setupComponent()
        cy.get('button').click()
        cy.get(testName('drop-down-menu'))

        cy.get(testName('menu-item')).first().next().focus().type('{rightArrow}') // opening the nested menu
        cy.get(testName('drop-down-menu')).should('have.length', 2) // two menus should be open
        cy.get(testName('menu-item')).first().next().focus().type('{rightArrow}{enter}') // click the first item in the nested menu
        cy.get(testName('drop-down-menu')).should('not.exist') // the whole tree should close
    })

    it('calls the action on item click', () => {
        const logoutAction = cy.stub()
        setupComponent(defaultTemplate, getMenuItems(logoutAction))

        cy.get('button').click()
        cy.get(testName('drop-down-menu'))

        cy.get(testName('menu-item'))
            .contains('Logout')
            .click()
            .then(() => {
                expect(logoutAction).to.be.calledOnce
            })

        cy.get(testName('drop-down-menu')).should('not.exist')
    })
})
