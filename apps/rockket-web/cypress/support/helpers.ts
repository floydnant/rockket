import { interceptItem } from '../../src/app/utils/menu-item.helpers'

export const testName = (testName: string) => `[data-test-name="${testName}"]`

export const useStubsForActions = <T>(stubMap?: Record<string, ReturnType<typeof cy.stub>>) => {
    return interceptItem<T>(({ action, title }) => {
        if (!action) return {}

        // We cannot use optional chaining syntax here, because cypress->webpack complains
        const customStub = title && stubMap && stubMap[title]
        const stub = customStub || cy.stub().as(`item:${title}`)
        return { action: stub }
    })
}
