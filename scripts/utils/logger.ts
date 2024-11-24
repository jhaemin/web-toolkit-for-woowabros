import chalk from 'chalk'

export class logger {
  static log(...data: unknown[]) {
    console.log(...data)
  }

  static success(message: string) {
    console.log(`${chalk.green('✔')} ${message}`)
  }

  static ask(message: string) {
    console.log(`${chalk.blue('?')} ${message}`)
  }

  static warning(message: string) {
    console.log(`${chalk.yellow('!')} ${message}`)
  }

  static error(message: string) {
    console.log(`${chalk.red('✖')} ${message}`)
  }
}
