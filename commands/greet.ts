import { BaseCommand, args, flags } from '@adonisjs/core/ace'
import type { CommandOptions } from '@adonisjs/core/types/ace'

export default class Greet extends BaseCommand {
  static commandName = 'greet'
  static description = 'Greet something'

  static options: CommandOptions = {}

  @args.string()
  declare name: string

  @flags.string({
    alias: ['j']
  })
  declare job: string

  async run() {
    this.logger.info(`Hello ${this.name} from "Greet". Your job is ${this.job}`)
  }
}