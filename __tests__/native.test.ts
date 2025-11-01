import { checkRollupAndroidArm64Issue } from '../src/scanner/native';

// Mock the file system functions
jest.mock('fs', () => ({
  existsSync: jest.fn(),
  readdirSync: jest.fn(),
  readFileSync: jest.fn(),
  accessSync: jest.fn()
}));

describe('Native Module Issue Detection', () => {
  describe('Rollup Android ARM64 Issue', () => {
    beforeEach(() => {
      // Clear all mocks before each test
      jest.clearAllMocks();
    });

    test('should not detect issue in non-Termux environment', async () => {
      // Save original env
      const originalPrefix = process.env.PREFIX;
      
      // Set non-Termux environment
      process.env.PREFIX = '/usr/local';
      
      const issue = await checkRollupAndroidArm64Issue();
      expect(issue).toBeNull();
      
      // Restore original env
      if (originalPrefix) {
        process.env.PREFIX = originalPrefix;
      } else {
        delete process.env.PREFIX;
      }
    });

    test('should not detect issue on non-ARM64 architecture', async () => {
      // Save original env and arch
      const originalPrefix = process.env.PREFIX;
      const originalArch = process.arch;
      
      // Set Termux environment but non-ARM64 architecture
      process.env.PREFIX = '/data/data/com.termux/files/usr';
      Object.defineProperty(process, 'arch', { value: 'x64' });
      
      const issue = await checkRollupAndroidArm64Issue();
      expect(issue).toBeNull();
      
      // Restore original values
      if (originalPrefix) {
        process.env.PREFIX = originalPrefix;
      } else {
        delete process.env.PREFIX;
      }
      Object.defineProperty(process, 'arch', { value: originalArch });
    });

    test('should detect confirmed issue in Termux ARM64 environment with rollup installed', async () => {
      // Save original env and arch
      const originalPrefix = process.env.PREFIX;
      const originalArch = process.arch;
      
      // Mock file system functions
      const fs = require('fs');
      fs.existsSync.mockImplementation((path: string) => {
        if (path.includes('node_modules')) return true;
        if (path.includes('rollup') && !path.includes('@rollup')) return true;
        if (path.includes('@rollup/rollup-android-arm64')) return true;
        return false;
      });
      
      // Set Termux ARM64 environment
      process.env.PREFIX = '/data/data/com.termux/files/usr';
      Object.defineProperty(process, 'arch', { value: 'arm64' });
      
      const issue = await checkRollupAndroidArm64Issue();
      expect(issue).not.toBeNull();
      expect(issue?.id).toBe('rollup-android-arm64-issue');
      expect(issue?.type).toBe('native-modules');
      expect(issue?.severity).toBe('critical');
      
      // Restore original values
      if (originalPrefix) {
        process.env.PREFIX = originalPrefix;
      } else {
        delete process.env.PREFIX;
      }
      Object.defineProperty(process, 'arch', { value: originalArch });
    });
  });
});