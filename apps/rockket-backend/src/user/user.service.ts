import {
    ConflictException,
    Injectable,
    InternalServerErrorException,
    Logger,
    NotFoundException,
    UnauthorizedException,
} from '@nestjs/common'
import { JwtService } from '@nestjs/jwt'
import { User } from '@prisma/client'
import * as bcrypt from 'bcrypt'
import { PrismaService } from '../prisma-abstractions/prisma.service'
import { LoginZodDto } from './user.dto'
import { SignupZodDto } from './user.dto'
import { UpdateEmailZodDto, UpdatePasswordZodDto, UpdateUserZodDto } from './user.dto'
import { IJwtPayload } from './jwt-payload.interface'
import { SELECT_UserPreview } from '../prisma-abstractions/query-helpers'
import { z } from 'zod'
import { UserPreview, UserSearchResult } from '@rockket/commons'

const prismaErrorSchema = z.object({ code: z.string() })

@Injectable()
export class UserService {
    constructor(private prisma: PrismaService, private jwtService: JwtService) {}

    private logger = new Logger('UsersService')

    async signup(credetials: SignupZodDto) {
        const createdUser = await this.createUser(credetials)

        return {
            user: this.getValidatedUser(createdUser),
            successMessage: `Signed up as '${createdUser.username}'.`,
        }
    }

    async login({ password, email }: LoginZodDto) {
        const foundUser = await this.prisma.user.findUnique({
            where: { email },
            select: {
                id: true,
                username: true,
                password: true,
            },
        })
        if (!foundUser) throw new UnauthorizedException("email:Couldn't find that account")
        await this.validatePassword(password, foundUser.password)

        return this.newAuthTokenResponse(foundUser)
    }

    newAuthTokenResponse(user: UserPreview) {
        return {
            user: this.getValidatedUser(user),
            successMessage: `Logged in as '${user.username}'.`,
        }
    }

    async authenticateFromToken(authToken: string) {
        try {
            const { id } = this.jwtService.verify<IJwtPayload>(authToken)
            const user = await this.prisma.user.findFirst({
                where: { id },
                select: { username: true },
            })

            return {
                id,
                username: user?.username,
                authenticated: !!user,
                // ListIds: [], // @TODO:
            }
        } catch (err) {
            return {
                id: null,
                username: null,
                authenticated: false,
                // ListIds: [],
            }
        }
    }

    async updateUser(user: User, { username: newUsername }: UpdateUserZodDto) {
        const updatedUser = await this.prisma.user.update({
            where: { id: user.id },
            data: { username: newUsername },
        })

        return {
            user: this.getValidatedUser(updatedUser),
            successMessage: `Updated username to '${newUsername}'.`,
        }
    }
    async updateEmail(user: User, { email: newEmail, password }: UpdateEmailZodDto) {
        try {
            await this.validatePassword(password, user.password)

            const userWithAlreadyExistingEmail = await this.prisma.user.findFirst({
                where: { email: newEmail },
            })
            if (userWithAlreadyExistingEmail) throw { code: 'P2002' }

            const updatedUser = await this.prisma.user.update({
                where: { id: user.id },
                data: { email: newEmail },
            })

            return {
                user: this.getValidatedUser(updatedUser),
                successMessage: `Updated email to '${newEmail}'.`,
            }
        } catch (err) {
            const result = prismaErrorSchema.safeParse(err)
            if (result.success && result.data.code != 'P2002') throw err

            // Conflict: duplicate email

            this.logger.verbose(`update user failed => '${newEmail}' already exists`)
            throw new ConflictException(`email:There is already an account associated with '${newEmail}'.`)
        }
    }

    async updatePassword(
        user: UserPreview & { password: string },
        { password, newPassword }: UpdatePasswordZodDto,
    ) {
        await this.validatePassword(password, user.password)

        const updatedUser = await this.prisma.user.update({
            where: { id: user.id },
            data: { password: await this.hashPassword(newPassword) },
        })

        return {
            user: this.getValidatedUser(updatedUser),
            successMessage: `Updated password for '${user.username}'.`,
        }
    }

    async deleteUser(user: User, password: string) {
        await this.validatePassword(password, user.password)

        const deletedUser = await this.prisma.user.delete({ where: { id: user.id } })
        if (deletedUser)
            return {
                successMessage: `Successfully deleted account '${user.username}'.`,
            }
        else throw new InternalServerErrorException('Failed to delete your account.')
    }

    private getValidatedUser({ username, id }: UserPreview) {
        return {
            id,
            username,
            authToken: this.createAuthToken({ id, username }),
        }
    }
    private createAuthToken(payload: IJwtPayload) {
        return this.jwtService.sign(payload)
    }

    private async validatePassword(passwordToValidate: string, password: string) {
        if (await bcrypt.compare(passwordToValidate, password)) return true
        else {
            this.logger.verbose('auth failed => Password is wrong')
            throw new UnauthorizedException('Wrong Password, try again.') // @TODO: we should implement a max retry for password guesses
        }
    }

    private async createUser({ password, username, email }: SignupZodDto) {
        const hashedPassword = await this.hashPassword(password)

        try {
            return await this.prisma.user.create({
                data: { password: hashedPassword, username, email },
            })
        } catch (err) {
            const result = prismaErrorSchema.safeParse(err)
            if (result.success && result.data.code != 'P2002') throw new InternalServerErrorException(err)
            // Conflict: duplicate email

            this.logger.verbose(`update user failed => '${email}' already exists`)
            throw new ConflictException(`email:There is already an account associated with '${email}'.`)
        }
    }

    private async hashPassword(password: string) {
        const salt = await bcrypt.genSalt()
        return await bcrypt.hash(password, salt)
    }

    /////////// public user actions ////////////
    async getUser(requestingUserId: string, requestedUserId: string) {
        try {
            const requestedUser = await this.prisma.user.findFirst({
                // @TODO: maybe this should only be accesible to users who are friends with the requested user
                where: { id: requestedUserId },
                ...SELECT_UserPreview,
            })
            return requestedUser
        } catch (err) {
            throw new NotFoundException('Could not find user.')
        }
    }

    async searchUsers(userId: string, query: string): Promise<UserSearchResult[]> {
        // This is where a full text search engine would come in handy
        const users = await this.prisma.user.findMany({
            where: {
                username: {
                    contains: query,
                },
                NOT: { id: userId },
            },
            ...SELECT_UserPreview,
        })
        return users
    }
}
