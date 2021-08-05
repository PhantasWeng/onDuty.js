import chalk from 'chalk'

const logger = console.log

export default {
  log: message => console.log(message),
  success : message => console.log(chalk.green(message)),
  error : message => console.log(chalk.red(message))
}
