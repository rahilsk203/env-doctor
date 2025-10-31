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