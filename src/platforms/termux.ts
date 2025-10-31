export class TermuxPlatform {
  static isTermux(): boolean {
    // Check if we're in Termux environment
    return !!process.env.PREFIX && process.env.PREFIX.includes('com.termux');
  }
  
  static async hasBuildEssentials(): Promise<boolean> {
    try {
      await this.exec('which pkg');
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