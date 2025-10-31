import path from 'path';
import { FileUtils } from '../utils/fs';
import { FixResult } from '../types';
import { exec } from '../utils/exec';
import { Logger } from '../utils/logger';

export class CleanupFixer {
  static async cleanNodeModules(cwd: string = process.cwd()): Promise<FixResult> {
    const result: FixResult = {
      success: false,
      message: '',
      fixedIssues: [],
      failedIssues: []
    };
    
    try {
      const nodeModulesPath = path.join(cwd, 'node_modules');
      const packageLockPath = path.join(cwd, 'package-lock.json');
      
      // Use Promise.all for parallel operations when possible
      const pathsToCheck = [nodeModulesPath, packageLockPath];
      const existenceChecks = await Promise.all(pathsToCheck.map(p => FileUtils.fileExists(p)));
      
      const [nodeModulesExists, packageLockExists] = existenceChecks;
      
      // Remove files in parallel when both exist
      const removalPromises: Promise<void>[] = [];
      
      if (nodeModulesExists) {
        Logger.log('Removing node_modules directory...', 'info');
        removalPromises.push(FileUtils.removeDir(nodeModulesPath));
        result.fixedIssues.push('node_modules-removed');
      }
      
      if (packageLockExists) {
        Logger.log('Removing package-lock.json...', 'info');
        removalPromises.push(FileUtils.removeDir(packageLockPath));
        result.fixedIssues.push('package-lock-removed');
      }
      
      // Execute all removals in parallel
      if (removalPromises.length > 0) {
        await Promise.all(removalPromises);
      }
      
      result.success = true;
      result.message = 'Successfully cleaned node_modules and lock files';
    } catch (error) {
      result.failedIssues.push('cleanup-failed');
      result.message = `Failed to clean up: ${error}`;
    }
    
    return result;
  }
  
  static async reinstallDependencies(cwd: string = process.cwd(), force: boolean = false): Promise<FixResult> {
    const result: FixResult = {
      success: false,
      message: '',
      fixedIssues: [],
      failedIssues: []
    };
    
    try {
      Logger.log('Installing dependencies...', 'info');
      
      // Determine which package manager to use with optimized parallel detection
      const lockFiles = [
        { file: 'yarn.lock', cmd: 'yarn install' },
        { file: 'pnpm-lock.yaml', cmd: 'pnpm install' },
        { file: 'package-lock.json', cmd: 'npm install' } // Default to npm
      ];
      
      let installCmd = 'npm install';
      
      // Check for lock files in parallel
      const existenceChecks = await Promise.all(
        lockFiles.map(async (lockFile) => ({
          ...lockFile,
          exists: await FileUtils.fileExists(path.join(cwd, lockFile.file))
        }))
      );
      
      // Find the first existing lock file (priority order)
      const existingLockFile = existenceChecks.find(lf => lf.exists);
      if (existingLockFile) {
        installCmd = existingLockFile.cmd;
      }
      
      if (force) {
        installCmd += ' --force';
      }
      
      const { stdout, stderr, code } = await exec(installCmd, { cwd });
      
      if (code === 0) {
        result.success = true;
        result.message = 'Dependencies successfully installed';
        result.fixedIssues.push('dependencies-installed');
      } else {
        result.failedIssues.push('install-failed');
        result.message = `Installation failed with code ${code}: ${stderr}`;
      }
    } catch (error) {
      result.failedIssues.push('install-error');
      result.message = `Installation error: ${error}`;
    }
    
    return result;
  }
}