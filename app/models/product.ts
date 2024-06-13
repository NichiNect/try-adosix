import { DateTime } from 'luxon'
import { BaseModel, column } from '@adonisjs/lucid/orm'

export default class Product extends BaseModel {
  @column({ isPrimary: true })
  declare id: number

  @column()
  declare name: string

  @column()
  declare price?: number | null

  @column()
  declare picture?: string | null

  @column.dateTime({ autoCreate: true })
  declare createdAt: DateTime

  @column.dateTime({ autoCreate: true, autoUpdate: true })
  declare updatedAt: DateTime

  public static columnDefinitions(): string[] {

    const columns: string[] = []
    for (const item of this['$columnsDefinitions'].keys()) {
        columns.push(item)
    }

    return columns
  }
}