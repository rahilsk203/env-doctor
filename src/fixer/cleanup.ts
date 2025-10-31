import path from 'path';
import fs from 'fs-extra';
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
      const existenceChecks = await Promise.all(pathsToCheck.map(p => fs.pathExists(p)));
      
      const [nodeModulesExists, packageLockExists] = existenceChecks;
      
      // Remove files in parallel when both exist
      const removalPromises: Promise<void>[] = [];
      
      if (nodeModulesExists) {
        Logger.log('Removing node_modules directory...', 'info');
        removalPromises.push(fs.remove(nodeModulesPath));
        result.fixedIssues.push('node_modules-removed');
      }
      
      if (packageLockExists) {
        Logger.log('Removing package-lock.json...', 'info');
        removalPromises.push(fs.remove(packageLockPath));
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
          exists: await fs.pathExists(path.join(cwd, lockFile.file))
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
  
  // Enhanced method to clean node-gyp cache
  static async cleanNodeGypCache(cwd: string = process.cwd()): Promise<FixResult> {
    const result: FixResult = {
      success: false,
      message: '',
      fixedIssues: [],
      failedIssues: []
    };
    
    try {
      const nodeGypCachePath = path.join(cwd, 'node_modules', '.cache', 'node-gyp');
      const nodeGypPath = path.join(cwd, 'node_modules', '.bin', 'node-gyp');
      const nodeVersionFile = path.join(cwd, 'node_modules', '.cache', 'node-gyp', '.node-version');
      
      // Check if node-gyp cache exists
      const cacheExists = await fs.pathExists(nodeGypCachePath);
      const binaryExists = await fs.pathExists(nodeGypPath);
      
      let cleanedSomething = false;
      
      // Remove node-gyp cache if it exists
      if (cacheExists) {
        Logger.log('Removing node-gyp cache...', 'info');
        await fs.remove(nodeGypCachePath);
        result.fixedIssues.push('node-gyp-cache-removed');
        cleanedSomething = true;
      }
      
      // Update the node version file
      if (cacheExists) {
        await fs.ensureDir(nodeGypCachePath);
        await fs.writeFile(nodeVersionFile, process.version);
        result.fixedIssues.push('node-version-recorded');
        cleanedSomething = true;
      }
      
      // Also try to clean using node-gyp command if available
      if (binaryExists) {
        try {
          Logger.log('Cleaning node-gyp cache via command...', 'info');
          await exec('node-gyp clean', { cwd });
          result.fixedIssues.push('node-gyp-cleaned');
          cleanedSomething = true;
        } catch (error) {
          Logger.log(`Failed to clean node-gyp via command: ${error}`, 'warn');
        }
      }
      
      if (cleanedSomething) {
        result.success = true;
        result.message = 'Successfully cleaned node-gyp cache';
      } else {
        result.success = true;
        result.message = 'No node-gyp cache found to clean';
      }
    } catch (error) {
      result.failedIssues.push('node-gyp-cache-cleanup-failed');
      result.message = `Failed to clean node-gyp cache: ${error}`;
    }
    
    return result;
  }
}