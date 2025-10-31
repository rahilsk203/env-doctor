import { colorize } from './colors';

export class Logger {
  static verboseMode = false;
  
  static log(message: string, type: 'info' | 'warn' | 'error' | 'success' = 'info') {
    const timestamp = new Date().toISOString();
    switch (type) {
      case 'info':
        console.log(`${colorize.gray(timestamp)} ${colorize.blue('INFO')} ${message}`);
        break;
      case 'warn':
        console.log(`${colorize.gray(timestamp)} ${colorize.yellow('WARN')} ${message}`);
        break;
      case 'error':
        console.log(`${colorize.gray(timestamp)} ${colorize.red('ERROR')} ${message}`);
        break;
      case 'success':
        console.log(`${colorize.gray(timestamp)} ${colorize.green('SUCCESS')} ${message}`);
        break;
    }
  }
  
  static verbose(message: string) {
    if (this.verboseMode) {
      const timestamp = new Date().toISOString();
      console.log(`${colorize.gray(timestamp)} ${colorize.cyan('VERBOSE')} ${message}`);
    }
  }
  
  static divider() {
    console.log(colorize.gray('-'.repeat(80)));
  }
}