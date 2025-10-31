export class MacOSPlatform {
  static isMacOS(): boolean {
    return process.platform === 'darwin';
  }
  
  static isAppleSilicon(): boolean {
    return process.arch === 'arm64';
  }
  
  static async hasHomebrew(): Promise<boolean> {
    try {
      await this.exec('which brew');
      return true;
    } catch {
      return false;
    }
  }
  
  static async hasXcodeCommandLineTools(): Promise<boolean> {
    try {
      await this.exec('xcode-select -p');
      return true;
    } catch {
      return false;
    }
  }
  
  static async exec(command: string): Promise<{ stdout: string; stderr: string }> {
    const { execSync } = require('child_process');
    const result = execSync(command, { encoding: 'utf8', stdio: ['pipe', 'pipe', 'pipe'] });
    return { stdout: result, stderr: '' };
  }
}