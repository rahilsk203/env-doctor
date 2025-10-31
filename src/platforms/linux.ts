export class LinuxPlatform {
  static isLinux(): boolean {
    return process.platform === 'linux';
  }
  
  static async getPackageManager(): Promise<string> {
    try {
      // Check for common package managers in order of preference
      const packageManagers = ['apt', 'yum', 'pacman', 'apk'];
      
      for (const pm of packageManagers) {
        try {
          await this.exec(`which ${pm}`);
          return pm;
        } catch {
          // Continue to next package manager
        }
      }
      
      return 'unknown';
    } catch {
      return 'unknown';
    }
  }
  
  static async exec(command: string): Promise<{ stdout: string; stderr: string }> {
    const { execSync } = require('child_process');
    const result = execSync(command, { encoding: 'utf8', stdio: ['pipe', 'pipe', 'pipe'] });
    return { stdout: result, stderr: '' };
  }
  
  static isDocker(): boolean {
    // Check for docker environment
    return !!process.env.DOCKER || 
           !!process.env.CONTAINER ||
           false;
  }
  
  static isWSL(): boolean {
    try {
      const { readFileSync } = require('fs');
      const procVersion = readFileSync('/proc/version', 'utf8');
      return procVersion.toLowerCase().includes('microsoft');
    } catch {
      return false;
    }
  }
}