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
import { LoginCredentialsDto, SignupCredentialsDto } from './dto/auth-credetials.dto'
import { UpdatePasswordDto, UpdateUserDto } from './dto/update-user.dto'
import { IJwtPayload } from './jwt-payload.interface'
import { IUserPreview, IUserSearchResult } from '../shared/index.model'
import { SELECT_user_preview } from '../prisma-abstractions/query-helpers'

@Injectable()
export class UserService {
    constructor(private prisma: PrismaService, private jwtService: JwtService) {}

    private logger = new Logger('UsersService')

    async signup(credetials: SignupCredentialsDto) {
        const createdUser = await this.createUser(credetials)

        return {
            user: this.getValidatedUser(createdUser),
            successMessage: `Signed up as '${createdUser.username}'.`,
        }
    }

    async login({ password, usernameOrEmail }: LoginCredentialsDto) {
        const foundUser = await this.prisma.user.findFirst({
            where: {
                OR: [{ username: usernameOrEmail }, { email: usernameOrEmail }],
            },
            select: {
                id: true,
                username: true,
                password: true,
            },
        })
        if (!foundUser) throw new UnauthorizedException('Username or Email is wrong')
        await this.validatePassword(password, foundUser.password)

        return {
            user: this.getValidatedUser(foundUser),
            successMessage: `Logged in as '${foundUser.username}'.`,
        }
    }

    renewAuthToken(user: IUserPreview) {
        return {
            user: this.getValidatedUser(user),
            successMessage: `Still logged in as '${user.username}'.`,
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
                // listIds: [], // @TODO:
            }
        } catch (err) {
            return {
                id: null,
                username: null,
                authenticated: false,
                // listIds: [],
            }
        }
    }

    async updateUser(user: User, updateUserDto: UpdateUserDto) {
        try {
            const updatedUser = await this.prisma.user.update({
                where: { id: user.id },
                data: updateUserDto,
            })
            const { username, email } = updatedUser
            const usernameChanged = user.username != username
            const emailChanged = user.email != email

            return {
                user: this.getValidatedUser(updatedUser),
                successMessage: `Updated ${usernameChanged ? `username to '${username}'` : ''}${
                    usernameChanged && emailChanged ? ' and ' : ''
                }${emailChanged ? `email to '${email}'` : ''}.`,
            }
        } catch (err) {
            if (err.code != 'P2002') throw new InternalServerErrorException(err)
            // conflict: duplicate email

            this.logger.verbose(`update user failed => '${updateUserDto.email}' already exists`)
            throw new ConflictException(
                `There is already an account associated with '${updateUserDto.email}'.`,
            )
        }
    }

    async updatePassword(
        user: IUserPreview & { password: string },
        { password, newPassword }: UpdatePasswordDto,
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

    private getValidatedUser({ username, id }: IUserPreview) {
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
            this.logger.verbose('auth failed => Username/Email or Password is wrong')
            throw new UnauthorizedException('Username/Email or Password is wrong')
        }
    }

    private async createUser({ password, username, email }: SignupCredentialsDto) {
        const hashedPassword = await this.hashPassword(password)

        try {
            return await this.prisma.user.create({
                data: { password: hashedPassword, username, email },
            })
        } catch (err) {
            if (err.code != 'P2002') throw new InternalServerErrorException(err)
            // conflict: duplicate email

            this.logger.verbose(`update user failed => '${email}' already exists`)
            throw new ConflictException(`There is already an account associated with '${email}'.`)
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
                ...SELECT_user_preview,
            })
            return requestedUser
        } catch (err) {
            throw new NotFoundException('Could not find user.')
        }
    }

    async searchUsers(userId: string, query: string /* , options: {} */): Promise<IUserSearchResult[]> {
        // this is where a full text search engine would come in handy
        const users = await this.prisma.user.findMany({
            where: {
                username: {
                    contains: query,
                },
                NOT: { id: userId },
            },
            ...SELECT_user_preview,
        })
        return users
    }
}
