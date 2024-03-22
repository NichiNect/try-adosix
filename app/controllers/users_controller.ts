import User from '#models/user'
import type { HttpContext } from '@adonisjs/core/http'
import vine from '@vinejs/vine'

export default class UsersController {
    public async index({ request, response }: HttpContext) {

        const search: string = request.input('search') || ''
        const page: number = request.input('page') || 1
        const limit: number = request.input('limit') || 10

        // * Find Data
        const data = await User.query()
            .if (search != '', (query: any) => {
        
                return query.where((q: any) => {
                    q.where('name', 'LIKE', `%${search}%`)
                        .orWhere('username', 'LIKE', `%${search}%`)
                })
            })
            .orderBy('created_at', 'desc')
            .paginate(page, limit)

        // * Response
        return response.send({
            message: 'Success',
            data
        })
    }

    public async show({ request, response }: HttpContext) {

        const id = request.param('id')

        // * Find Data
        const data = await User.query()
            .where('id', id)
            .first()

        if (!data) {
            return response.abort({
                message: 'User data not found'
            }, 404)
        }

        // * Response
        return response.send({
            message: 'Success',
            data
        })
    }

    public async store({ request, response }: HttpContext) {

        // * DTO Schema Creation
        const userSchema = vine.object({
            username: vine.string().alphaNumeric().unique( async (db: any, value: any) => {
                const user = await db.from('users')
                    .where('username', value)
                    .first()
                return !user
            }),
            name: vine.string(),
            password: vine.string().minLength(3).maxLength(32).confirmed()
        })

        const validatedData = await vine.validate({
            schema: userSchema,
            data: request.all()
        })

        // * Store to DB
        const newUser = await User.create({
            username: validatedData.username,
            name: validatedData.name,
            password: validatedData.password,
        })

        // * Response
        return response.send({
            message: 'Success',
            data: newUser
        })
    }

    public async update({ request, response }: HttpContext) {

        const id = request.param('id')

        // * DTO Schema Update
        const userSchema = vine.object({
            username: vine.string().alphaNumeric().unique( async (db: any, value: any) => {
                const user = await db.from('users')
                    .where('username', value)
                    .andWhere('id', '!=', id)
                    .first()
                return !user
            }),
            name: vine.string(),
            // password: vine.string().minLength(3).maxLength(32).confirmed()
        })

        const validatedData = await vine.validate({
            schema: userSchema,
            data: request.all()
        })

        // * Find Data
        const user = await User.query()
            .where('id', id)
            .first()

        if (!user) {
            return response.abort({
                message: 'Data user not found'
            }, 404)
        }

        // * Store to DB
        user.username = validatedData.username
        user.name = validatedData.name
        await user.save()

        // * Response
        return response.send({
            message: 'Success',
            data: user
        })
    }

    public async destroy({ request, response }: HttpContext) {

        const id = request.param('id')

        // * Find Data
        const user = await User.query()
            .where('id', id)
            .first()

        if (!user) {
            return response.abort({
                message: 'Data user not found'
            }, 404)
        }

        // * Delete Data
        await user.delete()

        // * Response
        return response.send({
            message: 'Success',
            data: user
        })
    }
}