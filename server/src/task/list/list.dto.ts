import { IsNotEmpty, IsOptional, IsString } from 'class-validator'

export class CreateTasklistDto {
    @IsString()
    @IsNotEmpty()
    name: string

    @IsOptional()
    @IsString()
    description?: string
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
    @IsNotEmpty()
    userId: string
}
