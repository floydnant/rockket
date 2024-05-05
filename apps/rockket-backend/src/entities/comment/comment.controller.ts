import {
    Body,
    Controller,
    Delete,
    ForbiddenException,
    Get,
    Param,
    Patch,
    Post,
    Query,
    UseGuards,
} from '@nestjs/common'
import { AuthGuard } from '@nestjs/passport'
import {
    CreateEntityCommentInput,
    EntityCommentType,
    ListPermission,
    User,
    createMatcher,
} from '@rockket/commons'
import { GetUser } from '../../decorators/get-user.decorator'
import { PermissionsService } from '../permissions/permissions.service'
import { CommentService } from './comment.service'
import {
    CreateEntityCommentZodDto,
    ListEntityCommentsZodQuery,
    UpdateEntityCommentZodDto,
} from './comment.zod-dto'

@Controller('comments')
@UseGuards(AuthGuard())
export class CommentController {
    constructor(private permissions: PermissionsService, private commentsService: CommentService) {}

    private hasPermission = createMatcher<
        EntityCommentType,
        { listId?: string | null; taskId?: string | null },
        [userId: string, permission: ListPermission]
    >().withAsyncCases({
        [EntityCommentType.TaskComment]: async (query, userId, permission) => {
            if (!query.taskId) return
            return await this.permissions.hasPermissionForTask(userId, query.taskId, permission)
        },
        [EntityCommentType.TasklistComment]: async (query, userId, permission) => {
            if (!query.listId) return
            return await this.permissions.hasPermissionForList(userId, query.listId!, permission)
        },
        default: () => {
            throw new Error('You must specify a task or list to retrieve comments for')
        },
    }).match

    private hasPermissionDiscriminated = createMatcher<
        EntityCommentType,
        CreateEntityCommentInput,
        [permission: ListPermission]
    >().withDiscriminatedAsyncCases('type', {
        [EntityCommentType.TaskComment]: async (input, permission) => {
            return await this.permissions.hasPermissionForTask(input.userId, input.taskId, permission)
        },
        [EntityCommentType.TasklistComment]: async (input, permission) => {
            return await this.permissions.hasPermissionForList(input.userId, input.listId, permission)
        },
    }).match

    @Post()
    async createComment(@GetUser() user: User, @Body() { data: dto }: CreateEntityCommentZodDto) {
        const hasPermission = await this.hasPermissionDiscriminated(
            { ...dto, userId: user.id },
            ListPermission.Comment,
        )
        if (!hasPermission) {
            throw new ForbiddenException("You don't have permission to comment here")
        }

        return await this.commentsService.createComment({ ...dto, userId: user.id })
    }

    @Get()
    async listComments(@GetUser() user: User, @Query() query: ListEntityCommentsZodQuery) {
        // Anyone with permission to view the task/list can view the comments
        const hasPermission = await this.hasPermission(query, user.id, ListPermission.View)
        if (!hasPermission) {
            throw new ForbiddenException("You don't have permission to view comments here")
        }

        return await this.commentsService.listComments(query)
    }

    @Get(':commentId')
    async getCommentById(@GetUser() user: User, @Param('commentId') commentId: string) {
        // Anyone with permission to view the task/list can view the comment
        const hasPermission = await this.permissions.hasPermissionForComment(
            user.id,
            commentId,
            ListPermission.View,
        )
        if (!hasPermission) throw new ForbiddenException("You don't have permission to see this comment")

        return await this.commentsService.getCommentById(commentId)
    }
    @Get(':commentId/replies')
    async listRepliesIds(@GetUser() user: User, @Param('commentId') commentId: string) {
        // Anyone with permission to view the task/list can view the comment
        const hasPermission = await this.permissions.hasPermissionForComment(
            user.id,
            commentId,
            ListPermission.View,
        )
        if (!hasPermission) throw new ForbiddenException("You don't have permission to see this comment")

        return await this.commentsService.listNestedRepliesIds(commentId)
    }

    @Patch(':commentId')
    async updateComment(
        @GetUser() user: User,
        @Param('commentId') commentId: string,
        @Body() comment: UpdateEntityCommentZodDto,
    ) {
        // Only the comment author can update their comments
        const hasPermission = await this.permissions.hasPermissionForComment(user.id, commentId)
        if (!hasPermission) throw new ForbiddenException("You don't have permission to update this comment")

        return await this.commentsService.updateComment(commentId, comment)
    }

    @Delete(':commentId')
    async deleteComment(@GetUser() user: User, @Param('commentId') commentId: string) {
        // The comment author themself or anyone w/ Manage permission can delete a comment
        const hasPermission = await this.permissions.hasPermissionForComment(
            user.id,
            commentId,
            ListPermission.Manage,
        )
        if (!hasPermission) throw new ForbiddenException("You don't have permission to delete this comment")

        return await this.commentsService.deleteComment(commentId)
    }
}
