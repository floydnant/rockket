import { z } from 'zod'
import { UserPreview, userSchema } from './user.model'

// @TODO: Clean up this file

const passwordSchema = z
    .string()
    .min(8, 'Password should be at least 8 characters long')
    .regex(
        /((?=.*\d)|(?=.*\W+))(?![.\n])(?=.*[A-ZÄÖÜß])(?=.*[a-zäöüß]).*$/,
        'Password should contain an upper case letter, a lower case letter and a special character or digit',
    )

const usernameSchema = z
    .string()
    .min(3, 'Username should be at least 3 characters long')
    .max(35, 'Username should not be longer than 35 characters')

const emailSchema = z.string().email('You must provide a valid email address')

export type SignupDto = z.infer<typeof signupDtoSchema>
export const signupDtoSchema = z.object({
    username: usernameSchema,
    email: emailSchema,
    password: passwordSchema,
})

export type LoginDto = z.infer<typeof loginDtoSchema>
export const loginDtoSchema = z.object({
    email: z.string(),
    password: z.string(),
})

export const updateUserDtoSchema = userSchema.pick({ username: true }).extend({
    username: usernameSchema,
})

export const updateEmailDtoSchema = z.object({
    password: z.string(),
    email: emailSchema,
})

export const updatePasswordDtoSchema = z.object({
    password: z.string(),
    newPassword: passwordSchema,
})

export type LoggedInUser = UserPreview & {
    authToken: string
}

export type UserSearchResult = {
    id: string
    username: string
}
