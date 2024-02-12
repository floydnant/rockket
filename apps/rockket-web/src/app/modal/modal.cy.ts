import { DialogModule } from '@angular/cdk/dialog'
import { Component, TemplateRef, ViewChild } from '@angular/core'
import { testName } from 'cypress/support/helpers'
import { DialogService } from './dialog.service'
import { ModalModule } from './modal.module'

const modalContent = 'This is the promised modal content'

@Component({
    selector: 'cy-dummy',
    template: `
        <ng-template #modalContent>
            <app-modal> ${modalContent} </app-modal>
        </ng-template>
    `,
})
class DummyComponent {
    constructor(public dialogService: DialogService) {}

    @ViewChild('modalContent') modalContent!: TemplateRef<HTMLElement>
    openModal() {
        this.dialogService.open(this.modalContent)
    }
}

const setupComponent = (template: string, onClose: () => void = () => '') => {
    cy.mount(template, {
        componentProperties: {
            onClose,
        },
        imports: [ModalModule, DialogModule],
        declarations: [DummyComponent],
    })
}

const templateWithDummy = `
    <button (click)="dummy.openModal()">
        This is the modal trigger
    </button>

    <cy-dummy #dummy></cy-dummy>
`

const modalHeader = 'The modal heading'
const templateWithPlainModal = `
    <app-modal [enableHeader]="true" (close)="onClose()">
        <ng-container header>${modalHeader}</ng-container>
        ${modalContent}
        <ng-container footer>The modal footer, usually with buttons: <button>A Button</button></ng-container>
    </app-modal>
`

describe('Custom modal', () => {
    it('can open a modal with custom content', () => {
        setupComponent(templateWithDummy)
        cy.get('button').click()

        cy.get(testName('modal')).contains(modalContent)
    })
    it('custom modal is hidden by default', () => {
        setupComponent(templateWithDummy)

        cy.get(testName('modal')).should('not.exist')
    })

    describe('Modal component', () => {
        it('can render the given content', () => {
            setupComponent(templateWithPlainModal)

            cy.get(testName('modal')).contains(modalHeader)
            cy.get(testName('modal')).contains(modalContent)
            cy.get(testName('modal')).get('button').contains('A Button')
        })

        it('emits a close event on close button click', () => {
            const closeSpy = cy.stub()
            setupComponent(templateWithPlainModal, closeSpy)

            cy.get(testName('modal-close-btn'))
                .click()
                .then(() => expect(closeSpy).to.be.calledOnce)
        })

        it.skip('can disable close button')
        it.skip('large content will cause scrolling')
    })
})
