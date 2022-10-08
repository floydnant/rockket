import { ReactiveFormsModule, Validators } from '@angular/forms'
import { InputComponent } from '../../atoms/input/input.component'
import { FormComponent } from './form.component'
import { FormBuilderOptions } from './types'

interface SetupComponentOptions {
    submitButton?: string
    extraErrorMessages?: Record<string, string[]>
    isLoading?: boolean
}

const setupComponent = (formOptions: FormBuilderOptions, options?: SetupComponentOptions) => {
    const submitStub = cy.stub()

    cy.mount(
        `<app-form 
                [formOptions]="formOptions"
                [extraErrorMessages]="extraErrorMessages"
                submitButton="${options?.submitButton || ''}"
                (formSubmit)="onSubmit($event)"
                [isLoading]="isLoading"
        ></app-form>`,
        {
            componentProperties: {
                formOptions,
                onSubmit: submitStub,
                extraErrorMessages: options?.extraErrorMessages,
                isLoading: options?.isLoading || false,
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
            setupComponent({
                username: {
                    control: [''],
                },
                password: {
                    control: [''],
                    name: 'Enter Password',
                },
            })

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
                { submitButton: 'Submit' }
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
                { submitButton: 'Submit' }
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
                { submitButton: 'Submit' }
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
                { submitButton: 'Submit' }
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
                {
                    submitButton: 'Submit',
                    extraErrorMessages: {
                        username: ['Sorry, this username is already taken.'],
                    },
                }
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
                { submitButton: 'Submit' }
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
                { submitButton: 'Submit' }
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

        it('prevents submission when form is in loading state', () => {
            setupComponent(
                {
                    username: {
                        control: ['', Validators.required],
                    },
                    password: {
                        control: ['', Validators.required],
                    },
                },
                { submitButton: 'Submit', isLoading: true }
            )

            cy.get('[data-test-name="input-username"]').should('be.disabled')
            cy.get('[data-test-name="input-password"]').should('be.disabled')

            cy.get('[data-test-name="submit-button"]').should('be.disabled')
        })
    })
})
