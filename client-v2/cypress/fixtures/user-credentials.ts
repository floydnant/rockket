export interface Credentials {
    email: string
    username: string
    password: string
    token: string
}

export const credentials: Record<string, Credentials> = {
    jonathan: {
        email: 'jonathan.butler@cy.com',
        username: 'Jonathan Butler',
        password: 'Password-123',
        token: '',
    },
    annie: {
        email: 'annie.edison@cy.com',
        username: 'Annie Edison',
        password: 'Password-123',
        token: '',
    },
}
