import { BaseCommand, args, flags } from '@adonisjs/core/ace'
import type { CommandOptions } from '@adonisjs/core/types/ace'
import string from '@adonisjs/core/helpers/string'
import fs from 'node:fs'
import path from 'node:path'

export default class Crud extends BaseCommand {
  static commandName = 'kawula:crud'
  static description = 'Generate Rest API CRUD Operation'

  static options: CommandOptions = {}

  @args.string()
  declare controllerName: string

  @flags.string({
    alias: ['m']
  })
  declare model: string

  /**
   * The stub to use for generating the controller
   */
  protected controllerStubPath: string = 'stubs/controller.stub'

  async run() {

    const namespace = this.controllerName.split('/');
    const controllerName = string.snakeCase(namespace[namespace.length - 1]);
    const className = namespace[namespace.length - 1];
    namespace.pop();

    const controllerTemplate = [
      {
        template: '{{ controllerName }}',
        value: className
      },
      {
        template: '{{ modelName }}',
        value: ''
      }
    ]

    let stub: string | any = await this.getStub()
    
    for (const item of controllerTemplate) {

      const regexFormat = new RegExp(`${item.template}`, 'g')
      stub = stub.replace(regexFormat, item.value)
    }

    const namespacePath = path.join(this.app.httpControllersPath(), ...namespace)
    const controllerDestinationPath = path.join(this.app.httpControllersPath(), ...namespace, `${controllerName}.ts`)

    if (fs.existsSync(controllerDestinationPath)) {
      this.logger.error('Controller is exist!')
      return;
    }

    // * Check Directory And Create It
    if (!fs.existsSync(namespacePath)) {

      fs.mkdirSync(namespacePath, {
        recursive: true
      })
    }

    // * Write Controller File
    fs.writeFile(controllerDestinationPath, stub, (err: any) => {
      if (err) {
        this.logger.error('Failed to write controller file')
        console.error(err)
      }
    })

    this.logger.success('Controller created')
  }

  private async getStub(path: string | null = null) {
    
    return new Promise((resolve: any, reject: any) => {
      fs.readFile(path ?? this.controllerStubPath, 'utf-8', (err: any, data: any) => {
        if (err) {
          this.logger.error('Stub file not found!')
          reject(err);
        }

        resolve(data);
      })
    })
  }
}