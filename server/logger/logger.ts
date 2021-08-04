import chalk from 'chalk';
import moment from 'moment';

export class Logger {
  static info(message: any) {
    console.log(
      `[${chalk.blue('INFO')}] ${chalk.gray(
        moment().format('hh:mm:ss')
      )} ${message}`
    );
  }

  static warning(message: any) {
    console.log(
      `[${chalk.yellow('WARNING')}] ${chalk.gray(
        moment().format('hh:mm:ss')
      )} ${message}`
    );
  }

  static error(message: any) {
    console.log(
      `[${chalk.red('Error')}] ${chalk.gray(
        moment().format('hh:mm:ss')
      )} ${message}`
    );
  }
}
