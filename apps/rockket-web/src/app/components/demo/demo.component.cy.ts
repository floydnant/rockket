import { DemoComponent } from './demo.component'

describe('DemoComponent', () => {
    it('should render properly', () => {
        cy.mount(DemoComponent)
        cy.contains('demo works!')
    })
})
