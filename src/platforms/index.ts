import { PlatformModule } from '../types';

export function getPlatformModule(): PlatformModule {
  switch (process.platform) {
    case 'win32':
      return require('./windows').default;
    case 'darwin':
      return require('./macos').default;
    case 'linux':
      // Check if we're in Termux
      if (process.env.PREFIX && process.env.PREFIX.includes('com.termux')) {
        return require('./termux').default;
      }
      return require('./linux').default;
    default:
      // Fallback to Linux implementation
      return require('./linux').default;
  }
}