import path from 'path';
import fs from 'fs-extra';
import { Issue } from '../types';
import { exec } from '../utils/exec';

export class DependenciesScanner {
  static async scan(cwd: string = process.cwd()): Promise<Issue[]> {
    const issues: Issue[] = [];
    
    // Check for node_modules
    const nodeModulesPath = path.join(cwd, 'node_modules');
    if (!(await fs.pathExists(nodeModulesPath))) {
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
    const hasPackageLock = await fs.pathExists(path.join(cwd, 'package-lock.json'));
    const hasYarnLock = await fs.pathExists(path.join(cwd, 'yarn.lock'));
    const hasPnpmLock = await fs.pathExists(path.join(cwd, 'pnpm-lock.yaml'));
    
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
    
    // Check for corrupted node_modules
    const corruptedIssues = await this.checkForCorruptedModules(cwd);
    issues.push(...corruptedIssues);
    
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
      
      // Try to verify yarn integrity
      if (hasYarnLock) {
        const { stdout, stderr, code } = await exec('yarn check --integrity', { cwd });
        if (code !== 0) {
          issues.push({
            id: 'yarn-dependency-drift',
            type: 'warning',
            message: 'yarn dependency drift detected. Run yarn install to fix.',
            severity: 'medium',
            fixAvailable: true
          });
        }
      }
      
      // Try to verify pnpm integrity
      if (hasPnpmLock) {
        const { stdout, stderr, code } = await exec('pnpm audit', { cwd });
        if (code !== 0) {
          issues.push({
            id: 'pnpm-dependency-drift',
            type: 'warning',
            message: 'pnpm dependency drift detected. Run pnpm install to fix.',
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
      if (await fs.pathExists(packageJsonPath)) {
        const packageJson = await fs.readJson(packageJsonPath);
        
        // Check for problematic optional dependencies
        const problematicOptionals = ['fsevents', 'playwright'];
        const installedOptionals: string[] = [];
        
        // Check which optional dependencies are installed
        const optionalDeps = packageJson.optionalDependencies || {};
        for (const dep of problematicOptionals) {
          if (dep in optionalDeps) {
            const nodeModulesDepPath = path.join(cwd, 'node_modules', dep);
            if (await fs.pathExists(nodeModulesDepPath)) {
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
  
  private static async checkForCorruptedModules(cwd: string): Promise<Issue[]> {
    const issues: Issue[] = [];
    
    try {
      // Check for common signs of corrupted node_modules:
      // 1. Missing package.json files in modules
      // 2. Incomplete installations
      // 3. Permission issues
      
      const nodeModulesPath = path.join(cwd, 'node_modules');
      if (await fs.pathExists(nodeModulesPath)) {
        // Check a few random modules for package.json files
        const dirs = await fs.readdir(nodeModulesPath);
        const moduleDirs = dirs.filter(dir => !dir.startsWith('.')).slice(0, 5); // Check first 5 modules
        
        let corruptedCount = 0;
        for (const moduleDir of moduleDirs) {
          const packageJsonPath = path.join(nodeModulesPath, moduleDir, 'package.json');
          if (!(await fs.pathExists(packageJsonPath))) {
            corruptedCount++;
          }
        }
        
        // If more than 50% of checked modules are missing package.json, likely corruption
        if (moduleDirs.length > 0 && corruptedCount / moduleDirs.length > 0.5) {
          issues.push({
            id: 'corrupted-node-modules',
            type: 'error',
            message: 'node_modules appears to be corrupted. Consider removing and reinstalling.',
            severity: 'high',
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