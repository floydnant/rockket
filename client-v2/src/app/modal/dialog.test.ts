import { DialogModule } from '@angular/cdk/dialog'
import { Component } from '@angular/core'
import { testName } from 'cypress/support/helpers'
import { DialogService } from './dialog.service'
import { ModalModule } from './modal.module'
import { DialogOptions } from './types'

@Component({ selector: 'cy-dummy', template: `` })
class DummyComponent {
    constructor(public dialogService: DialogService) {}
}

const defaultModalTitle = 'This is the modal title'
const defaultModalText = 'This is the modal text'
const getTemplate = (
    method: 'alert' | 'confirm' = 'confirm',
    options: DialogOptions = { title: defaultModalTitle, text: defaultModalText }
) => `
    <button (click)="dummy.dialogService.${method}(${JSON.stringify(options).replace(
    /"/g,
    "'"
)}).closed.subscribe(onRes)">
        This is the modal trigger
    </button>

    <cy-dummy #dummy></cy-dummy>
`

const setupComponent = (template = getTemplate(), onRes: (res?: string) => void = () => '') => {
    cy.mount(template, {
        componentProperties: {
            onRes,
        },
        imports: [ModalModule, DialogModule],
        declarations: [DummyComponent],
    })
}

describe('Dialog API and DialogComponent', () => {
    it('can open the dialog', () => {
        setupComponent()

        cy.get('button').click()
        cy.get(testName('modal'))
        cy.get(testName('modal-dialog')).contains(defaultModalTitle)
        cy.get(testName('modal-dialog')).contains(defaultModalText)
        cy.get(testName('dialog-button')).should('have.length', 2)
    })

    it('dialog closes on button click', () => {
        setupComponent()

        cy.get('button').click()
        cy.get(testName('dialog-button')).last().click()
        cy.get(testName('modal-dialog')).should('not.exist')
    })

    it('responds with the correct string', () => {
        const responseSpy = cy.stub()
        setupComponent(
            getTemplate('confirm', {
                title: defaultModalTitle,
                buttons: [{ text: 'Abort' }, { text: 'Submit' }],
            }),
            responseSpy
        )

        cy.get('button').click()
        cy.get(testName('dialog-button'))
            .contains('Submit')
            .click()
            .then(() => {
                expect(responseSpy).to.be.calledOnceWith('Submit')
            })
    })
    it('responds with a custom response code', () => {
        const responseSpy = cy.stub()
        setupComponent(
            getTemplate('confirm', {
                title: defaultModalTitle,
                buttons: [{ text: 'Abort' }, { text: 'Submit', resCode: 'customResCode' }],
            }),
            responseSpy
        )

        cy.get('button').click()
        cy.get(testName('dialog-button'))
            .contains('Submit')
            .click()
            .then(() => {
                expect(responseSpy).to.be.calledOnceWith('customResCode')
            })
    })
})
