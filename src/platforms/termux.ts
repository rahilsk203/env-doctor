import { PlatformModule } from '../types';

const termuxPlatform: PlatformModule = {
  async detect(): Promise<boolean> {
    // Check if we're in Termux environment
    return !!(process.env.PREFIX && process.env.PREFIX.includes('com.termux'));
  },

  getInstallCommand(packageName: string): string {
    return `pkg install ${packageName}`;
  },

  getBuildTools(): string[] {
    return ['build-essential', 'python', 'make', 'g++', 'clang', 'cmake'];
  }
};

export default termuxPlatform;