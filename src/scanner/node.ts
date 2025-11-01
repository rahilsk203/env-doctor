import { NodeInfo, Issue } from '../types';
import { execCommand } from '../utils/exec';

export async function scanNode(): Promise<NodeInfo & { issues?: Issue[] }> {
  const info: NodeInfo & { issues?: Issue[] } = {
    version: process.version,
    manager: 'unknown',
    managerVersion: 'unknown',
    issues: []
  };

  // Try to detect package manager
  try {
    // Check for npm
    try {
      const npmVersion = await execCommand('npm --version');
      info.manager = 'npm';
      info.managerVersion = npmVersion.trim();
    } catch {
      // Check for yarn
      try {
        const yarnVersion = await execCommand('yarn --version');
        info.manager = 'yarn';
        info.managerVersion = yarnVersion.trim();
      } catch {
        // Check for pnpm
        try {
          const pnpmVersion = await execCommand('pnpm --version');
          info.manager = 'pnpm';
          info.managerVersion = pnpmVersion.trim();
        } catch {
          // No package manager found
        }
      }
    }
  } catch (error) {
    // Could not determine package manager
    info.issues = info.issues || [];
    info.issues.push({
      id: 'package-manager-detection-failed',
      type: 'package-manager',
      severity: 'medium',
      message: 'Could not detect package manager',
      fixAvailable: false
    });
  }

  return info;
}