import User from '#models/user'
import type { HttpContext } from '@adonisjs/core/http'
import encryption from '@adonisjs/core/services/encryption'
import hash from '@adonisjs/core/services/hash'
import vine from '@vinejs/vine'

export default class AuthController {

    public async login({ request, response }: HttpContext) {

        // * DTO Schema
        const loginSchema = vine.object({
            username: vine.string().alphaNumeric(),
            password: vine.string().minLength(3).maxLength(32).confirmed()
        })

        const validatedData = await vine.validate({
            schema: loginSchema,
            data: request.all()
        })

        const user = await User.query()
            .where('username', validatedData.username)
            .first()

        if (!user) {
            return response.abort({
                message: 'User not found',
            }, 404)
        }

        // * Validate Password
        if (!(await hash.verify(user.password, validatedData.password))) {

            return response.unauthorized({
                message: 'Invalid credentials',
            })
        }

        // * Create Token
        const token = await User.accessTokens.create(user)

        // * Create Refresh Token
        const refreshToken = encryption.encrypt({
            key: 'APPNAME',
            username: user.username
        })

        return response.send({
            message: 'Success',
            data: {
                user,
                token,
                refresh_token: refreshToken
            }
        })
    }
}