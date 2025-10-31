export class WindowsPlatform {
  static isWindows(): boolean {
    return process.platform === 'win32';
  }
  
  static isWSL(): boolean {
    return process.env.WSL_DISTRO_NAME !== undefined;
  }
  
  static hasVisualStudio(): boolean {
    return !!process.env.VSINSTALLDIR || !!process.env.VisualStudioVersion;
  }
  
  static hasWindowsSDK(): boolean {
    return !!process.env.WindowsSdkDir;
  }
  
  static async exec(command: string): Promise<{ stdout: string; stderr: string }> {
    const { execSync } = require('child_process');
    const result = execSync(command, { encoding: 'utf8', stdio: ['pipe', 'pipe', 'pipe'] });
    return { stdout: result, stderr: '' };
  }
}