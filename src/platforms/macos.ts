import { PlatformModule } from '../types';

const macosPlatform: PlatformModule = {
  async detect(): Promise<boolean> {
    return process.platform === 'darwin';
  },

  getInstallCommand(packageName: string): string {
    return `brew install ${packageName}`;
  },

  getBuildTools(): string[] {
    return ['python3', 'make', 'g++', 'clang', 'cmake'];
  }
};

export default macosPlatform;