import { ListPermission } from '@prisma/client'
import { IsEnum, IsNotEmpty, IsOptional, IsString } from 'class-validator'

export class CreateTasklistDto {
    @IsString()
    @IsNotEmpty()
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
    @IsEnum(ListPermission)
    permission?: ListPermission
}

export class UpdatePermissionsDto {
    @IsEnum(ListPermission)
    permission: ListPermission
}
