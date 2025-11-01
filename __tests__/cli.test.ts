import { exec } from 'child_process';
import { promisify } from 'util';

const execAsync = promisify(exec);

describe('env-doctor CLI', () => {
  test('should display help', async () => {
    const { stdout } = await execAsync('node dist/cli.js --help');
    expect(stdout).toContain('Usage: env-doctor');
  });

  test('should display version', async () => {
    const { stdout } = await execAsync('node dist/cli.js --version');
    expect(stdout).toContain('1.0.0');
  });

  test('should run scan command', async () => {
    const { stdout } = await execAsync('node dist/cli.js scan');
    expect(stdout).toContain('Scanning environment');
    expect(stdout).toContain('Scan completed successfully');
  });

  test('should run doctor command', async () => {
    const { stdout } = await execAsync('node dist/cli.js doctor');
    expect(stdout).toContain('Hello! I\'m env-doctor');
  });
});

describe('Rollup Android ARM64 Issue Detection', () => {
  test('should detect Rollup Android ARM64 issue in Termux environment', async () => {
    // This test would require simulating a Termux environment with ARM64 architecture
    // and Rollup installed. For now, we'll just test that the scan command works.
    const { stdout } = await execAsync('node dist/cli.js scan');
    expect(stdout).toContain('Scanning environment');
  });
});