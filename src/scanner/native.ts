import path from 'path';
import fs from 'fs-extra';
import { Issue } from '../types';
import { exec } from '../utils/exec';

export class NativeModulesScanner {
  static async scan(cwd: string = process.cwd()): Promise<Issue[]> {
    const issues: Issue[] = [];
    
    // Check for build tools
    const buildToolIssues = await this.checkBuildTools();
    issues.push(...buildToolIssues);
    
    // Check for node-gyp issues
    const nodeGypIssues = await this.checkNodeGypIssues(cwd);
    issues.push(...nodeGypIssues);
    
    return issues;
  }
  
  private static async checkBuildTools(): Promise<Issue[]> {
    const issues: Issue[] = [];
    const platform = process.platform;
    
    try {
      if (platform === 'win32') {
        // On Windows, check for Visual Studio Build Tools
        // This is a simplified check - in reality, you'd want to check the registry
        // or look for specific environment variables
        const hasVS = !!(process.env.VSINSTALLDIR || process.env.VisualStudioVersion);
        if (!hasVS) {
          issues.push({
            id: 'missing-vs-build-tools',
            type: 'warning',
            message: 'Visual Studio Build Tools not detected. Native modules may fail to compile.',
            severity: 'high',
            fixAvailable: true
          });
        }
      } else {
        // On Unix-like systems, check for build essentials
        const requiredTools = ['python3', 'make', 'g++'];
        for (const tool of requiredTools) {
          try {
            await exec(`${tool} --version`);
          } catch {
            issues.push({
              id: `missing-${tool}`,
              type: 'warning',
              message: `${tool} not found. Required for compiling native modules.`,
              severity: 'high',
              fixAvailable: true
            });
          }
        }
      }
    } catch (error) {
      issues.push({
        id: 'build-tools-check-failed',
        type: 'error',
        message: `Failed to check build tools: ${error}`,
        severity: 'low',
        fixAvailable: false
      });
    }
    
    return issues;
  }
  
  private static async checkNodeGypIssues(cwd: string): Promise<Issue[]> {
    const issues: Issue[] = [];
    
    try {
      // Check for node-gyp cache issues
      const nodeGypDir = path.join(cwd, 'node_modules', '.bin', 'node-gyp');
      if (await fs.pathExists(nodeGypDir)) {
        // Check for common node-gyp issues:
        // 1. Node.js version changes since last build
        // 2. ABI compatibility
        // 3. Corrupted build cache
        
        // Check if there's a node-gyp cache directory
        const nodeGypCacheDir = path.join(cwd, 'node_modules', '.cache', 'node-gyp');
        const hasCache = await fs.pathExists(nodeGypCacheDir);
        
        // Check if we have native modules that might need rebuilding
        const hasNativeModules = await this.hasNativeModules(cwd);
        
        if (hasCache && hasNativeModules) {
          // Check if Node.js version has changed since last build
          const nodeVersionChanged = await this.hasNodeVersionChanged(cwd);
          
          if (nodeVersionChanged) {
            issues.push({
              id: 'node-gyp-cache-issue',
              type: 'warning',
              message: 'Node.js version has changed since last build. node-gyp cache may be outdated.',
              severity: 'medium',
              fixAvailable: true
            });
          }
        }
      }
      
      // Check for common node-gyp errors in package-lock.json or yarn.lock
      const lockfilePath = path.join(cwd, 'package-lock.json');
      if (await fs.pathExists(lockfilePath)) {
        const lockfileContent = await fs.readFile(lockfilePath, 'utf8');
        if (lockfileContent.includes('node-gyp') && lockfileContent.includes('error')) {
          issues.push({
            id: 'node-gyp-lockfile-error',
            type: 'warning',
            message: 'node-gyp errors detected in lockfile. Consider cleaning and reinstalling.',
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
  
  private static async hasNativeModules(cwd: string): Promise<boolean> {
    try {
      // Check package.json for dependencies that typically require native compilation
      const packageJsonPath = path.join(cwd, 'package.json');
      if (await fs.pathExists(packageJsonPath)) {
        const packageJson = await fs.readJson(packageJsonPath);
        const deps = { ...packageJson.dependencies, ...packageJson.devDependencies };
        
        // Common packages that require native compilation
        const nativePackages = [
          'node-sass', 'sqlite3', 'bcrypt', 'canvas', 'sharp', 'fibers',
          'native-ext', 'native-module', 'node-expat', 'node-xml', 'iconv',
          'bufferutil', 'utf-8-validate', 'fsevents'
        ];
        
        for (const dep of Object.keys(deps)) {
          if (nativePackages.includes(dep)) {
            return true;
          }
        }
      }
      
      // Check node_modules for .node files (native modules)
      const nodeModulesPath = path.join(cwd, 'node_modules');
      if (await fs.pathExists(nodeModulesPath)) {
        const files = await fs.readdir(nodeModulesPath);
        // Filter to only string entries and check for .node extension
        const stringFiles = files.filter(file => typeof file === 'string') as string[];
        if (stringFiles.some(file => file.endsWith('.node'))) {
          return true;
        }
      }
    } catch (error) {
      // Silently ignore
    }
    
    return false;
  }
  
  private static async hasNodeVersionChanged(cwd: string): Promise<boolean> {
    try {
      // Check if we have a record of the last Node.js version used
      const nodeGypCacheDir = path.join(cwd, 'node_modules', '.cache', 'node-gyp');
      const versionFile = path.join(nodeGypCacheDir, '.node-version');
      
      if (await fs.pathExists(versionFile)) {
        const lastVersion = await fs.readFile(versionFile, 'utf8');
        const currentVersion = process.version;
        return lastVersion.trim() !== currentVersion;
      } else {
        // Create the version file for future checks
        await fs.ensureDir(nodeGypCacheDir);
        await fs.writeFile(versionFile, process.version);
        return false;
      }
    } catch (error) {
      // Silently ignore
      return false;
    }
  }
}