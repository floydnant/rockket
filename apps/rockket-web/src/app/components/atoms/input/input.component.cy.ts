import { FormControl, ReactiveFormsModule, Validators } from '@angular/forms'
import { InputComponent } from './input.component'

describe('InputComponent', () => {
    let control: FormControl

    beforeEach(() => {
        control = new FormControl('', [Validators.required, Validators.minLength(3), Validators.maxLength(10)])
        cy.mount(
            `<app-input 
                name="Test input"
                [control]="control"
                [errorMessages]="errorMessages"
                [extraErrorMessages]="extraErrorMessages"
            ></app-input>`,
            {
                componentProperties: {
                    control,
                    errorMessages: {
                        maxLength: '$name has a maximum length of $value',
                    },
                },
                declarations: [InputComponent],
                imports: [ReactiveFormsModule],
            }
        )
    })

    it('renders properly', () => {
        // @TODO: add `cy.getByTestName()` command here
        cy.get('[data-test-name*="input-placeholder"]').contains('Test input')
        cy.get('input').should('have.value', '')
    })

    it('reflects the input in the FormControl', () => {
        cy.get('input')
            .type('typed text')
            .then(() => {
                expect(control.value).to.equal('typed text')
            })
    })
    it('FormControl can update dom value', () => {
        control.setValue('updated value')
        cy.get('input').should('have.value', 'updated value')
    })

    describe('displays errors for invalid input', () => {
        it('should display required error', () => {
            cy.get('input').type('t{Backspace}')

            // @TODO: add `cy.getByTestName()` command here
            cy.get('[data-test-name="validation-errors"]').contains('required')
            cy.get('input').type('enough')
            cy.get('[data-test-name="validation-errors"]').should('not.exist')
        })
        it('should display minLength error', () => {
            cy.get('input').type('te')

            // @TODO: add `cy.getByTestName()` command here
            cy.get('[data-test-name="validation-errors"]').contains('at least')
            cy.get('input').type('enough')
            cy.get('[data-test-name="validation-errors"]').should('not.exist')
        })
        it('should display custom maxLength error', () => {
            cy.get('input').type('text that is clearly too long')

            // @TODO: add `cy.getByTestName()` command here
            cy.get('[data-test-name="validation-errors"]').contains('maximum length')
        })

        // It('should display extra errors', () => {
        // })
    })
})
