import { Password, Username, validation } from './auth-credetials.dto'
import { IsEmail, IsNotEmpty, IsString } from 'class-validator'

export class UpdateUserDto extends Username {
    // @IsEmail(...validation.email.isEmail)
    // email: string
}

export class UpdateEmailDto extends Password {
    @IsEmail(...validation.email.isEmail)
    email: string
}

export class UpdatePasswordDto extends Password {
    @IsNotEmpty({ message: 'You need to provide a new password.' })
    @IsString()
    newPassword: string
}
