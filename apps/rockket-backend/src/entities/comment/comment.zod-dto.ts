import {
    createEntityCommentDtoSchema,
    listEntityCommentsQuerySchema,
    updateEntityCommentDtoSchema,
} from '@rockket/commons'
import { createZodDto } from 'nestjs-zod'

export class CreateEntityCommentZodDto extends createZodDto(createEntityCommentDtoSchema) {}
export class UpdateEntityCommentZodDto extends createZodDto(updateEntityCommentDtoSchema) {}
export class ListEntityCommentsZodQuery extends createZodDto(listEntityCommentsQuerySchema) {}
