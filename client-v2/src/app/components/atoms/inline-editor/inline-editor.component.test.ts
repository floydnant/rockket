import { testName } from 'cypress/support/helpers'
import { BehaviorSubject } from 'rxjs'
import { FocusableDirective } from 'src/app/directives/focusable.directive'
import { MutationDirective } from 'src/app/directives/mutation.directive'
import { InlineEditorComponent, INLINE_EDITOR_DELAY_TIME } from './inline-editor.component'
import { HighlightPipe } from 'src/app/pipes/highlight.pipe'
import { RxModule } from 'src/app/rx/rx.module'

const setupComponent = (props: {
    textInput$: BehaviorSubject<string>
    onUpdate: (text: string) => void
    placeholder?: string
}) => {
    return cy.mount(
        `<app-inline-editor
            [textInput]="textInput$ | async"
            (update)="onUpdate($event)"
            [placeholder]="placeholder"
        ></app-inline-editor>`,
        {
            componentProperties: props,
            imports: [RxModule],
            declarations: [InlineEditorComponent, MutationDirective, FocusableDirective, HighlightPipe],
            providers: [],
        }
    )
}

describe('InlineEditorComponent', () => {
    describe('Input', () => {
        it('renders the textInput', () => {
            const textContent = 'text content'
            setupComponent({
                textInput$: new BehaviorSubject(textContent),
                onUpdate: cy.stub().as('onUpdate'),
            })

            cy.get(testName('inline-editor')).contains(textContent)
        })

        it('renders external textInput updates', () => {
            const originalText = 'text content'
            const textInput$ = new BehaviorSubject(originalText)
            const updatedText = 'externally updated text content'

            setupComponent({ textInput$, onUpdate: cy.stub().as('onUpdate') })

            cy.get(testName('inline-editor')).contains(originalText)
            textInput$.next(updatedText)
            cy.get(testName('inline-editor')).contains(updatedText)

            cy.get(testName('inline-editor')).should('not.be.focused')
        })

        it("doesn't render external textInput updates if they're equal to previous edits", () => {
            const originalText = 'text content'
            const textInput$ = new BehaviorSubject(originalText)
            const updatedText = 'updated text content'
            const onUpdate = cy.stub().as('onUpdate')

            setupComponent({ textInput$, onUpdate })

            cy.get(testName('inline-editor')).contains(originalText)
            cy.get(testName('inline-editor'))
                .click()
                .type('{selectAll}{backspace}' + updatedText)

            textInput$.next(updatedText)
            cy.get(testName('inline-editor')).should('be.focused') // when a re-render happens, the editor looses focus

            cy.wait(INLINE_EDITOR_DELAY_TIME).then(() => {
                // @TODO: maybe the editor should not be emitting if the same content just came in
                expect(onUpdate).to.be.calledOnceWith(updatedText)
            })
        })
    })

    describe('Output', () => {
        it('emits updated text after delay', () => {
            const originalText = 'text content'
            const updatedText = 'the updated text'
            const onUpdate = cy.stub().as('onUpdate')

            setupComponent({
                textInput$: new BehaviorSubject(originalText),
                onUpdate,
            })
            cy.contains(originalText) // wait for content to render

            cy.get(testName('inline-editor'))
                .click()
                .type('{selectAll}{backspace}' + updatedText)
                .then(() => {
                    expect(onUpdate).to.not.be.called
                })

            // @TODO: I guess we could implement something that reduces the delay time for tests
            cy.wait(INLINE_EDITOR_DELAY_TIME).then(() => {
                expect(onUpdate).to.be.calledOnceWith(updatedText)
            })
        })

        it('emits updated text immediately after pressing enter', () => {
            const originalText = 'text content'
            const updatedText = 'the updated text'
            const onUpdate = cy.stub().as('onUpdate')

            setupComponent({
                textInput$: new BehaviorSubject(originalText),
                onUpdate,
            })
            cy.contains(originalText) // wait for content to render

            cy.get(testName('inline-editor'))
                .click()
                .type('{selectAll}{backspace}' + updatedText + '{enter}')
                .then(() => {
                    expect(onUpdate).to.be.calledOnceWith(updatedText)
                })
        })

        it('emits updated text immediately after blur', () => {
            const originalText = 'text content'
            const updatedText = 'the updated text'
            const onUpdate = cy.stub().as('onUpdate')

            setupComponent({
                textInput$: new BehaviorSubject(originalText),
                onUpdate,
            })
            cy.contains(originalText) // wait for content to render

            cy.get(testName('inline-editor'))
                .click()
                .type('{selectAll}{backspace}' + updatedText)
                .blur()
                .then(() => {
                    expect(onUpdate).to.be.calledOnceWith(updatedText)
                })
        })
    })

    describe('Placeholder', () => {
        it.skip('can render a placeholder', () => {
            const placeholder = 'a placeholder'
            setupComponent({
                textInput$: new BehaviorSubject(''),
                onUpdate: cy.stub().as('onUpdate'),
                placeholder,
            })

            // cy.get(testName('inline-editor')).contains(placeholder) // @TODO: we must assert on the :before's content property
        })
    })
})
