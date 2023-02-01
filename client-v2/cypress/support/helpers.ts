import { interceptItem } from '../../src/app/utils/menu-item.helpers'

export const testName = (testName: string) => `[data-test-name="${testName}"]`

export const useStubsForActions = (stubMap?: Record<string, ReturnType<typeof cy.stub>>) => {
    return interceptItem(({ action, title }) => {
        const customStub = title && stubMap?.[title]
        const stub = customStub || cy.stub().as(`item:${title}`)
        return { action: action && stub }
    })
}
