import { PlatformModule } from '../types';

const linuxPlatform: PlatformModule = {
  async detect(): Promise<boolean> {
    return process.platform === 'linux';
  },

  getInstallCommand(packageName: string): string {
    // Check which package manager is available
    // This is a simplified approach - in reality, we'd want to detect the preferred package manager
    return `sudo apt install ${packageName}`;
  },

  getBuildTools(): string[] {
    return ['build-essential', 'python3', 'make', 'g++', 'clang', 'cmake'];
  }
};

export default linuxPlatform;