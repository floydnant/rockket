import { ReactiveFormsModule, Validators } from '@angular/forms'
import { InputComponent } from '../../atoms/input/input.component'
import { FormComponent } from './form.component'
import { FormBuilderOptions } from './types'

const setupComponent = (
    formOptions: FormBuilderOptions,
    submitButton: string,
    extraErrorMessages: Record<string, string[]> = {}
) => {
    const submitStub = cy.stub()

    cy.mount(
        `<app-form 
                [formOptions]="formOptions"
                [extraErrorMessages]="extraErrorMessages"
                submitButton="${submitButton}"
                (formSubmit)="onSubmit($event)"
        ></app-form>`,
        {
            componentProperties: {
                formOptions,
                onSubmit: submitStub,
                extraErrorMessages,
            },
            declarations: [FormComponent, InputComponent],
            imports: [ReactiveFormsModule],
        }
    )

    return submitStub
}

describe('FormComponent', () => {
    describe('Variants', () => {
        it('renders input fields', () => {
            setupComponent(
                {
                    username: {
                        control: [''],
                    },
                    password: {
                        control: [''],
                        name: 'Enter Password',
                    },
                },
                ''
            )

            cy.get('[data-test-name="input-username"]')
            cy.get('[data-test-name="input-placeholder-username"]').contains('Username')
            cy.get('[data-test-name="input-password"]')
            cy.get('[data-test-name="input-placeholder-password"]').contains('Enter Password')

            cy.get('[data-test-name="submit-button"]').should('not.exist')
        })

        it('renders input fields + submit button', () => {
            setupComponent(
                {
                    username: {
                        control: [''],
                    },
                    password: {
                        control: [''],
                    },
                },
                'Submit'
            )

            cy.get('[data-test-name="input-username"]')
            cy.get('[data-test-name="input-placeholder-username"]').contains('Username')
            cy.get('[data-test-name="input-password"]')
            cy.get('[data-test-name="input-placeholder-password"]').contains('Password')

            cy.get('[data-test-name="submit-button"]').contains('Submit')
        })
    })

    describe('Error messages', () => {
        it("doesn't show errors by default", () => {
            setupComponent(
                {
                    username: {
                        control: ['', Validators.required],
                    },
                    password: {
                        control: ['', Validators.required],
                    },
                },
                'Submit'
            )

            // not submitting the form
            cy.get('[data-test-name="validation-errors"]').should('have.length', 0)
        })

        it('shows errors for invalid inputs on submit', () => {
            setupComponent(
                {
                    username: {
                        control: ['', Validators.required],
                    },
                    password: {
                        control: ['', Validators.required],
                    },
                },
                'Submit'
            )

            cy.get('[data-test-name="submit-button"]').click()
            cy.get('[data-test-name="validation-errors"]').should('have.length', 2)
        })

        it('can show custom errors', () => {
            setupComponent(
                {
                    username: {
                        control: ['', Validators.required],
                        errorMessages: {
                            required: 'Test custom error message',
                        },
                    },
                    password: [''],
                },
                'Submit'
            )

            cy.get('[data-test-name="submit-button"]').click()
            cy.get('[data-test-name="validation-errors"]').should('have.length', 1)
            cy.get('[data-test-name="validation-errors"]').contains('Test custom error message')
        })
        it('can show extra errors', () => {
            setupComponent(
                {
                    username: {
                        control: ['', Validators.required],
                        errorMessages: {
                            required: 'Test custom error message',
                        },
                    },
                    password: [''],
                },
                'Submit',
                { username: ['Sorry, this username is already taken.'] }
            )

            cy.get('[data-test-name="validation-errors"]').should('have.length', 1)
            cy.get('[data-test-name="validation-errors"]').contains('Sorry, this username is already taken.')
        })
    })

    describe('Submission', () => {
        it('prevents submission when form is invalid', () => {
            const submitStub = setupComponent(
                {
                    username: {
                        control: ['', Validators.required],
                    },
                    password: {
                        control: ['', Validators.required],
                    },
                },
                'Submit'
            )

            cy.get('[data-test-name="input-username"]').type('this is the username')
            // leave password blank

            cy.get('[data-test-name="submit-button"]')
                .click()
                .then(() => {
                    expect(submitStub).to.not.have.been.called
                })
        })

        it('submits the correct data', () => {
            const submitStub = setupComponent(
                {
                    username: {
                        control: ['', Validators.required],
                    },
                    password: {
                        control: ['', Validators.required],
                    },
                },
                'Submit'
            )

            cy.get('[data-test-name="input-username"]').type('this is the username')
            cy.get('[data-test-name="input-password"]').type('this is the password')

            cy.get('[data-test-name="submit-button"]')
                .click()
                .then(() => {
                    expect(submitStub).to.have.been.calledWith({
                        username: 'this is the username',
                        password: 'this is the password',
                    })
                })
        })
    })
})
