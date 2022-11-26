export interface User {
    id: string
    username: string
    email: string
}
export type UserPreview = Pick<User, 'id' | 'username'>
