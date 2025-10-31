import os from 'os';
import { EnvironmentInfo } from '../types';
import { exec } from '../utils/exec';

export class SystemScanner {
  static async scan(): Promise<EnvironmentInfo> {
    const envInfo: EnvironmentInfo = {
      nodeVersion: process.version,
      npmVersion: await this.getNpmVersion(),
      os: this.getOS(),
      arch: os.arch(),
      shell: this.getShell(),
      isWSL: this.isWSL(),
      isDocker: this.isDocker(),
      isCI: this.isCI()
    };
    
    return envInfo;
  }
  
  private static async getNpmVersion(): Promise<string> {
    try {
      const { stdout } = await exec('npm --version');
      return stdout.trim();
    } catch {
      return 'unknown';
    }
  }
  
  private static getOS(): string {
    const platform = os.platform();
    switch (platform) {
      case 'darwin': return 'macOS';
      case 'win32': return 'Windows';
      case 'linux': return 'Linux';
      default: return platform;
    }
  }
  
  private static getShell(): string {
    return process.env.SHELL || process.env.ComSpec || 'unknown';
  }
  
  private static isWSL(): boolean {
    return os.release().toLowerCase().includes('microsoft');
  }
  
  private static isDocker(): boolean {
    // Check for docker environment
    return process.env.DOCKER === 'true' || 
           (process.env.CONTAINER === 'true') ||
           false;
  }
  
  private static isCI(): boolean {
    return !!process.env.CI || 
           !!process.env.GITHUB_ACTIONS || 
           !!process.env.TRAVIS || 
           !!process.env.JENKINS ||
           false;
  }
}