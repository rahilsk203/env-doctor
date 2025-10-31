import path from 'path';
import { FileUtils } from '../utils/fs';
import { Issue } from '../types';
import { exec } from '../utils/exec';

export class DependenciesScanner {
  static async scan(cwd: string = process.cwd()): Promise<Issue[]> {
    const issues: Issue[] = [];
    
    // Check for node_modules
    const nodeModulesPath = path.join(cwd, 'node_modules');
    if (!(await FileUtils.fileExists(nodeModulesPath))) {
      issues.push({
        id: 'missing-node-modules',
        type: 'error',
        message: 'node_modules directory is missing. Run npm install.',
        severity: 'critical',
        fixAvailable: true
      });
      // If node_modules is missing, we can't check for integrity issues
      return issues;
    }
    
    // Check for package-lock.json or yarn.lock
    const hasPackageLock = await FileUtils.fileExists(path.join(cwd, 'package-lock.json'));
    const hasYarnLock = await FileUtils.fileExists(path.join(cwd, 'yarn.lock'));
    const hasPnpmLock = await FileUtils.fileExists(path.join(cwd, 'pnpm-lock.yaml'));
    
    if (!hasPackageLock && !hasYarnLock && !hasPnpmLock) {
      issues.push({
        id: 'missing-lockfile',
        type: 'warning',
        message: 'No lockfile found. Consider running npm install to generate one.',
        severity: 'medium',
        fixAvailable: true
      });
    }
    
    // Check for lockfile drift
    const lockfileDriftIssues = await this.checkLockfileDrift(cwd, hasPackageLock, hasYarnLock, hasPnpmLock);
    issues.push(...lockfileDriftIssues);
    
    // Check for optional dependencies issues
    const optionalDepIssues = await this.checkOptionalDependencies(cwd);
    issues.push(...optionalDepIssues);
    
    return issues;
  }
  
  private static async checkLockfileDrift(
    cwd: string, 
    hasPackageLock: boolean, 
    hasYarnLock: boolean, 
    hasPnpmLock: boolean
  ): Promise<Issue[]> {
    const issues: Issue[] = [];
    
    try {
      // Try to verify npm integrity
      if (hasPackageLock) {
        const { stdout, stderr, code } = await exec('npm ls --depth=0', { cwd });
        if (code !== 0) {
          issues.push({
            id: 'npm-dependency-drift',
            type: 'warning',
            message: 'npm dependency drift detected. Run npm install to fix.',
            severity: 'medium',
            fixAvailable: true
          });
        }
      }
    } catch (error) {
      // Silently ignore, we'll catch this in other checks
    }
    
    return issues;
  }
  
  private static async checkOptionalDependencies(cwd: string): Promise<Issue[]> {
    const issues: Issue[] = [];
    
    try {
      const packageJsonPath = path.join(cwd, 'package.json');
      if (await FileUtils.fileExists(packageJsonPath)) {
        const packageJson = await FileUtils.readJsonFile(packageJsonPath);
        
        // Check for problematic optional dependencies
        const problematicOptionals = ['fsevents', 'playwright'];
        const installedOptionals: string[] = [];
        
        // Check which optional dependencies are installed
        const optionalDeps = packageJson.optionalDependencies || {};
        for (const dep of problematicOptionals) {
          if (dep in optionalDeps) {
            const nodeModulesDepPath = path.join(cwd, 'node_modules', dep);
            if (await FileUtils.fileExists(nodeModulesDepPath)) {
              installedOptionals.push(dep);
            }
          }
        }
        
        // Report issues with installed problematic optionals
        if (installedOptionals.includes('fsevents') && process.platform !== 'darwin') {
          issues.push({
            id: 'fsevents-non-macos',
            type: 'warning',
            message: 'fsevents is installed but only works on macOS. This may cause issues on other platforms.',
            severity: 'medium',
            fixAvailable: true
          });
        }
      }
    } catch (error) {
      // Silently ignore
    }
    
    return issues;
  }
}