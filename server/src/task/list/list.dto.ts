import { ListPermission } from '@prisma/client'
import { IsEnum, IsNotEmpty, IsOptional, IsString } from 'class-validator'
import { enumInvalidMessage } from '../../utilities/validation'

export class CreateTasklistDto {
    @IsNotEmpty()
    @IsString()
    name: string

    @IsOptional()
    @IsString()
    description?: string

    @IsOptional()
    @IsString()
    parentListId?: string
}
export class UpdateTasklistDto {
    @IsOptional()
    @IsString()
    name?: string

    @IsOptional()
    @IsString()
    description?: string
}
export class ShareTasklistDto {
    @IsOptional()
    @IsEnum(ListPermission, enumInvalidMessage('permission', ListPermission))
    permission?: ListPermission
}

export class UpdatePermissionsDto {
    @IsEnum(ListPermission, enumInvalidMessage('permission', ListPermission))
    permission: ListPermission
}
