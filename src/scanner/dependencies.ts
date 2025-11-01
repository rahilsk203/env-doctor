import { DependencyInfo, Issue } from '../types';
import { existsSync } from 'fs';
import { join } from 'path';

export async function scanDependencies(): Promise<DependencyInfo & { issues?: Issue[] }> {
  const info: DependencyInfo & { issues?: Issue[] } = {
    nodeModulesExists: existsSync(join(process.cwd(), 'node_modules')),
    lockFileExists: existsSync(join(process.cwd(), 'package-lock.json')) || 
                   existsSync(join(process.cwd(), 'yarn.lock')) || 
                   existsSync(join(process.cwd(), 'pnpm-lock.yaml')),
    lockFileDrift: false, // Would need to implement actual check
    checksumMismatch: false, // Would need to implement actual check
    issues: []
  };

  // Check for common issues
  if (!info.nodeModulesExists) {
    info.issues = info.issues || [];
    info.issues.push({
      id: 'node-modules-missing',
      type: 'node-modules',
      severity: 'high',
      message: 'node_modules directory is missing',
      fixAvailable: true,
      fixCommand: 'npm install'
    });
  }

  if (!info.lockFileExists) {
    info.issues = info.issues || [];
    info.issues.push({
      id: 'lock-file-missing',
      type: 'lockfile',
      severity: 'medium',
      message: 'Lock file is missing',
      fixAvailable: true,
      fixCommand: 'npm install'
    });
  }

  return info;
}