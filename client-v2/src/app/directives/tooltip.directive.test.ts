import { OverlayModule } from '@angular/cdk/overlay'
import { testName } from 'cypress/support/helpers'
import { TooltipComponent } from '../components/atoms/tooltip/tooltip.component'
import { TooltipDirective } from './tooltip.directive'

const tooltipString = "And this is it's tooltip"
const defaultTemplate = `<button appTooltip="${tooltipString}">This is a button</button>`

const setupComponent = (template = defaultTemplate) => {
    cy.mount(template, {
        componentProperties: {},
        imports: [OverlayModule],
        declarations: [TooltipDirective, TooltipComponent],
    })
}

describe('TooltipDirective', () => {
    it("doesn't show the tooltip by default", () => {
        setupComponent()

        cy.get(testName('tooltip')).should('not.exist')
    })

    describe('Keyboard interaction', () => {
        it('renders the tooltip on focus', () => {
            setupComponent()

            cy.get('button').focus()
            cy.get(testName('tooltip')).contains(tooltipString)
        })

        it('hides the tooltip on blur', () => {
            setupComponent()
            cy.get('button').focus()
            cy.get(testName('tooltip')).contains(tooltipString)

            cy.get('button').blur()
            cy.get(testName('tooltip')).should('not.exist')
        })
    })

    describe('Mouse interaction', () => {
        it('renders the tooltip on mouseenter', () => {
            setupComponent()

            cy.get('button').trigger('mouseenter')
            cy.get(testName('tooltip')).contains(tooltipString)
        })

        it('hides the tooltip on mouseleave', () => {
            setupComponent()
            cy.get('button').trigger('mouseenter')
            cy.get(testName('tooltip')).contains(tooltipString)

            cy.get('button').trigger('mouseleave')
            cy.get(testName('tooltip')).should('not.exist')
        })

        it('hides the tooltip on click by default', () => {
            setupComponent()
            cy.get('button').trigger('mouseenter')
            cy.get(testName('tooltip')).contains(tooltipString)

            cy.get('button').click()
            cy.get(testName('tooltip')).should('not.exist')
        })
        it("doesn't hide the tooltip on click when prop is given", () => {
            setupComponent(
                `<button appTooltip="${tooltipString}" [tooltipOptions]="{ closeOnHostClick: false }">This is a button</button>`
            )
            cy.get('button').trigger('mouseenter')
            cy.get(testName('tooltip')).contains(tooltipString)

            cy.get('button').click()
            cy.get(testName('tooltip')).contains(tooltipString)
        })
    })

    describe.skip('Positioning', () => {
        it('test preferredPosition')
        it('test avoidPositions')
    })
})
