import { CreateTasklistDto } from '../src/entities/list/list.dto'

export const users = {
    jonathan: {
        password: 'Password_WithoutComplains123',
        username: 'Jonathan Doe',
        email: 'j.doe@example.com',
    },
    bob: {
        password: 'Password_WithoutComplains123',
        username: 'Bob Vance from Vance Refrigeration',
        email: 'b.vance@vance-refrigeration.com',
    },
    annie: {
        password: 'Password_WithoutComplains123',
        username: 'Annie Edison',
        email: 'annie.e@example.com',
    },
}

export const newList: CreateTasklistDto = {
    title: 'The new tasklist',
}
