import chalk from 'chalk';

export class Logger {
  static verboseMode = false;
  
  static log(message: string, type: 'info' | 'warn' | 'error' | 'success' = 'info') {
    const timestamp = new Date().toISOString();
    switch (type) {
      case 'info':
        console.log(`${chalk.gray(timestamp)} ${chalk.blue('INFO')} ${message}`);
        break;
      case 'warn':
        console.log(`${chalk.gray(timestamp)} ${chalk.yellow('WARN')} ${message}`);
        break;
      case 'error':
        console.log(`${chalk.gray(timestamp)} ${chalk.red('ERROR')} ${message}`);
        break;
      case 'success':
        console.log(`${chalk.gray(timestamp)} ${chalk.green('SUCCESS')} ${message}`);
        break;
    }
  }
  
  static verbose(message: string) {
    if (this.verboseMode) {
      const timestamp = new Date().toISOString();
      console.log(`${chalk.gray(timestamp)} ${chalk.cyan('VERBOSE')} ${message}`);
    }
  }
  
  static divider() {
    console.log(chalk.gray('-'.repeat(80)));
  }
}