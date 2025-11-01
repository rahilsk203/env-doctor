import { PlatformModule } from '../types';

const windowsPlatform: PlatformModule = {
  async detect(): Promise<boolean> {
    return process.platform === 'win32';
  },

  getInstallCommand(packageName: string): string {
    // Prefer Chocolatey, fallback to Scoop, then WinGet
    return `choco install ${packageName} -y || scoop install ${packageName} || winget install ${packageName}`;
  },

  getBuildTools(): string[] {
    return ['python', 'make', 'g++', 'clang', 'cmake', 'visualstudio', 'windowssdk'];
  }
};

export default windowsPlatform;