import path from 'path';
import fs from 'fs-extra';
import { Issue } from '../types';
import { exec } from '../utils/exec';

export class NodeScanner {
  static async scan(cwd: string = process.cwd()): Promise<Issue[]> {
    const issues: Issue[] = [];
    
    // Check Node.js version
    const nodeVersionIssues = await this.checkNodeVersion(cwd);
    issues.push(...nodeVersionIssues);
    
    // Check npm version compatibility
    const npmVersionIssues = await this.checkNpmVersion(cwd);
    issues.push(...npmVersionIssues);
    
    // Check for multiple Node.js installations that might cause conflicts
    const nodeInstallationIssues = await this.checkNodeInstallations();
    issues.push(...nodeInstallationIssues);
    
    return issues;
  }
  
  private static async checkNodeVersion(cwd: string): Promise<Issue[]> {
    const issues: Issue[] = [];
    
    try {
      // Check for .nvmrc file
      const nvmrcPath = path.join(cwd, '.nvmrc');
      if (await fs.pathExists(nvmrcPath)) {
        const requiredVersion = (await fs.readFile(nvmrcPath, 'utf8')).trim();
        const currentVersion = process.version;
        
        if (!this.isVersionCompatible(currentVersion, requiredVersion)) {
          issues.push({
            id: 'node-version-mismatch',
            type: 'warning',
            message: `Node.js version mismatch. Current: ${currentVersion}, Required: ${requiredVersion}`,
            severity: 'medium',
            file: '.nvmrc',
            fixAvailable: true
          });
        }
      }
      
      // Check package.json engines
      const packageJsonPath = path.join(cwd, 'package.json');
      if (await fs.pathExists(packageJsonPath)) {
        const packageJson = await fs.readJson(packageJsonPath);
        if (packageJson.engines && packageJson.engines.node) {
          const requiredVersion = packageJson.engines.node;
          const currentVersion = process.version;
          
          if (!this.isVersionCompatible(currentVersion, requiredVersion)) {
            issues.push({
              id: 'node-engine-mismatch',
              type: 'warning',
              message: `Node.js version doesn't meet engine requirement. Current: ${currentVersion}, Required: ${requiredVersion}`,
              severity: 'medium',
              file: 'package.json',
              fixAvailable: true
            });
          }
        }
      }
      
      // Check if Node.js version is outdated (more than 2 years old)
      const currentVersion = process.version.replace('v', '');
      const currentParts = currentVersion.split('.').map(Number);
      const majorVersion = currentParts[0];
      
      // Node.js major versions are typically supported for 30 months
      // Versions older than 16 are likely outdated
      if (majorVersion < 16) {
        issues.push({
          id: 'node-version-outdated',
          type: 'warning',
          message: `Node.js version ${process.version} is outdated. Consider upgrading to a newer LTS version.`,
          severity: 'medium',
          fixAvailable: true
        });
      }
    } catch (error) {
      issues.push({
        id: 'node-version-check-failed',
        type: 'error',
        message: `Failed to check Node.js version: ${error}`,
        severity: 'low',
        fixAvailable: false
      });
    }
    
    return issues;
  }
  
  private static async checkNpmVersion(cwd: string): Promise<Issue[]> {
    const issues: Issue[] = [];
    
    try {
      const { stdout } = await exec('npm --version');
      const npmVersion = stdout.trim();
      
      // Check package.json engines for npm
      const packageJsonPath = path.join(cwd, 'package.json');
      if (await fs.pathExists(packageJsonPath)) {
        const packageJson = await fs.readJson(packageJsonPath);
        if (packageJson.engines && packageJson.engines.npm) {
          const requiredVersion = packageJson.engines.npm;
          
          if (!this.isVersionCompatible(npmVersion, requiredVersion)) {
            issues.push({
              id: 'npm-engine-mismatch',
              type: 'warning',
              message: `npm version doesn't meet engine requirement. Current: ${npmVersion}, Required: ${requiredVersion}`,
              severity: 'medium',
              file: 'package.json',
              fixAvailable: true
            });
          }
        }
      }
      
      // Check if npm version is outdated
      const npmParts = npmVersion.split('.').map(Number);
      const npmMajorVersion = npmParts[0];
      
      // npm versions older than 6 are likely outdated
      if (npmMajorVersion < 6) {
        issues.push({
          id: 'npm-version-outdated',
          type: 'warning',
          message: `npm version ${npmVersion} is outdated. Consider upgrading to a newer version.`,
          severity: 'low',
          fixAvailable: true
        });
      }
    } catch (error) {
      issues.push({
        id: 'npm-version-check-failed',
        type: 'error',
        message: `Failed to check npm version: ${error}`,
        severity: 'low',
        fixAvailable: false
      });
    }
    
    return issues;
  }
  
  private static async checkNodeInstallations(): Promise<Issue[]> {
    const issues: Issue[] = [];
    
    try {
      // Check for multiple Node.js installations that might cause conflicts
      const nodePaths: string[] = [];
      
      // Check common installation paths
      const commonPaths = [
        '/usr/local/bin/node',
        '/usr/bin/node',
        '/opt/nodejs/bin/node',
        process.env.NODEJS_HOME,
        process.env.NVM_DIR
      ];
      
      // Filter out undefined paths
      const validPaths = commonPaths.filter(p => p !== undefined) as string[];
      
      for (const nodePath of validPaths) {
        if (await fs.pathExists(nodePath)) {
          nodePaths.push(nodePath);
        }
      }
      
      // On Windows, check PATH for multiple node.exe installations
      if (process.platform === 'win32') {
        const { stdout } = await exec('where node');
        const paths = stdout.trim().split('\n').filter(p => p.trim() !== '');
        nodePaths.push(...paths);
      } else {
        try {
          const { stdout } = await exec('which -a node');
          const paths = stdout.trim().split('\n').filter(p => p.trim() !== '');
          nodePaths.push(...paths);
        } catch (error) {
          // Ignore errors
        }
      }
      
      // If we found multiple installations, warn the user
      if (nodePaths.length > 1) {
        issues.push({
          id: 'multiple-node-installations',
          type: 'warning',
          message: `Multiple Node.js installations detected. This may cause conflicts. Found installations: ${nodePaths.join(', ')}`,
          severity: 'low',
          fixAvailable: true
        });
      }
    } catch (error) {
      // Silently ignore
    }
    
    return issues;
  }
  
  private static isVersionCompatible(current: string, required: string): boolean {
    // Simple version comparison (in a real implementation, you might want to use semver)
    const currentParts = current.replace('v', '').split('.').map(Number);
    const requiredParts = required.replace('v', '').split('.').map(Number);
    
    for (let i = 0; i < Math.min(currentParts.length, requiredParts.length); i++) {
      if (currentParts[i] < requiredParts[i]) return false;
      if (currentParts[i] > requiredParts[i]) return true;
    }
    
    return true;
  }
}