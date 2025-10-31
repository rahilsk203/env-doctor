import path from 'path';
import { FileUtils } from '../utils/fs';
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
      if (await FileUtils.fileExists(nodeGypDir)) {
        // This is a simplified check. In reality, you might want to check:
        // - Node.js version changes since last build
        // - ABI compatibility
        // - Corrupted build cache
        
        // For now, we'll just add a placeholder issue
        // In a real implementation, you'd have more sophisticated checks
        const hasGypIssues = false; // Placeholder
        
        if (hasGypIssues) {
          issues.push({
            id: 'node-gyp-cache-issue',
            type: 'warning',
            message: 'node-gyp cache may be corrupted. Consider rebuilding native modules.',
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