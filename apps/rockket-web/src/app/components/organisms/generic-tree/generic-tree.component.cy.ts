import { RxModule } from 'src/app/rx/rx.module'
import { IconsModule } from '../../atoms/icons/icons.module'
import { GenericTreeComponent } from './generic-tree.component'

const setupComponent = () => {
    cy.mount(`<app-tree [...] ></app-tree>`, {
        componentProperties: {},
        imports: [IconsModule, RxModule],
        declarations: [GenericTreeComponent],
        providers: [],
    })
}

describe(GenericTreeComponent.name, () => {
    it.skip('renders nodes', () => {
        setupComponent()

        // @TODO
    })

    it.skip('can toggle nodes', () => {
        setupComponent()

        // @TODO
    })
})
