import type { CommandOptions } from '@adonisjs/core/types/ace'
import { BaseCommand, args, flags } from '@adonisjs/core/ace'
import ace from '@adonisjs/core/services/ace'
import string from '@adonisjs/core/helpers/string'
import fs from 'node:fs'
import path from 'node:path'

export default class Crud extends BaseCommand {
  static commandName = 'kawula:crud'
  static description = 'Generate Rest API CRUD Operation'

  static options: CommandOptions = {
    startApp: true,
  }

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
    const moduleName = className.replace(/Controller/g, '')
    namespace.pop();

    const controllerTemplate = [
      {
        template: '{{ controllerName }}',
        value: className
      },
      {
        template: '{{ modelName }}',
        value: string.pascalCase(this.model)
      },
      {
        template: '{{ modelNameLowerCase }}',
        value: this.model?.toLowerCase()
      },
      {
        template: '{{ modelNamePlural }}',
        value: string.plural(this.model)
      },
      {
        template: '{{ modelNamePluralLowerCase }}',
        value: string.plural(this.model)?.toLowerCase()
      },
      {
        template: '{{ moduleName }}',
        value: moduleName
      },
      {
        template: '{{ validatorNamespace }}',
        value: `${namespace?.join('/')}/${moduleName?.toLowerCase()}`
      },
    ]

    // * Create Validator
    await this.generateValidator(moduleName, namespace)

    // * Create Controller
    await this.generateController(controllerName, namespace, controllerTemplate)

  }

  private async generateController(controllerName: string, namespace: string[], controllerTemplate: any[]) {

    // * Initiate Stub
    let stub: string | any = await this.getStub(this.controllerStubPath)
    
    for (const item of controllerTemplate) {

      const regexFormat = new RegExp(`${item.template}`, 'g')
      stub = stub.replaceAll(regexFormat, item.value)
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

    this.logger.success(`Controller created: ${controllerDestinationPath}`)
  }

  private async generateValidator(validatorName: string, namespace: string[]) {

    const validatorPath = path.join(this.app.validatorsPath(), ...namespace, `${validatorName?.toLowerCase()}.ts`)

    if (fs.existsSync(validatorPath)) {
      this.logger.error('Validator class is exist!')
      return;
    }

    await ace.exec('make:validator', [
      `${namespace?.join('/')}/${validatorName}`,
      '--resource'
    ])

    this.logger.success(`Validator class created: ${validatorPath}`)
  }

  private async getStub(path: string) {
    
    return new Promise((resolve: any, reject: any) => {
      fs.readFile(path, 'utf-8', (err: any, data: any) => {
        if (err) {
          this.logger.error('Stub file not found!')
          reject(err);
        }

        resolve(data);
      })
    })
  }
}