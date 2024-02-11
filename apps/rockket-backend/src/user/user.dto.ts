import {
    loginDtoSchema,
    signupDtoSchema,
    updateEmailDtoSchema,
    updatePasswordDtoSchema,
    updateUserDtoSchema,
} from '@rockket/commons'
import { createZodDto } from 'nestjs-zod'

export class SignupZodDto extends createZodDto(signupDtoSchema) {}
export class LoginZodDto extends createZodDto(loginDtoSchema) {}

export class UpdateUserZodDto extends createZodDto(updateUserDtoSchema) {}
export class UpdateEmailZodDto extends createZodDto(updateEmailDtoSchema) {}
export class UpdatePasswordZodDto extends createZodDto(updatePasswordDtoSchema) {}
