import { Issue, FixResult } from '../types';
import { CleanupFixer } from './cleanup';
import { SystemToolsFixer } from './system-tools';
import { Logger } from '../utils/logger';

export class Fixer {
  // Enhanced mapping of issue IDs to their fix functions with improved logic
  private static readonly ISSUE_FIX_MAP: { [key: string]: (cwd: string, issue?: Issue) => Promise<FixResult | FixResult[]> } = {
    'missing-node-modules': async (cwd: string) => {
      const cleanResult = await CleanupFixer.cleanNodeModules(cwd);
      if (cleanResult.success) {
        const installResult = await CleanupFixer.reinstallDependencies(cwd);
        return [cleanResult, installResult];
      }
      return cleanResult;
    },
    'node-version-mismatch': async (cwd: string, issue?: Issue) => {
      // Enhanced fix that also tries to suggest version switching tools
      const cleanResult = await CleanupFixer.cleanNodeModules(cwd);
      if (cleanResult.success) {
        const installResult = await CleanupFixer.reinstallDependencies(cwd);
        // Add suggestion for Node.js version management
        if (installResult.success) {
          installResult.message += '. Consider using nvm or n to manage Node.js versions.';
        }
        return [cleanResult, installResult];
      }
      return cleanResult;
    },
    'node-engine-mismatch': async (cwd: string) => {
      const cleanResult = await CleanupFixer.cleanNodeModules(cwd);
      if (cleanResult.success) {
        const installResult = await CleanupFixer.reinstallDependencies(cwd);
        // Add suggestion for Node.js version management
        if (installResult.success) {
          installResult.message += '. Consider using nvm or n to manage Node.js versions.';
        }
        return [cleanResult, installResult];
      }
      return cleanResult;
    },
    'npm-engine-mismatch': async (cwd: string) => {
      const cleanResult = await CleanupFixer.cleanNodeModules(cwd);
      if (cleanResult.success) {
        const installResult = await CleanupFixer.reinstallDependencies(cwd);
        // Add suggestion for npm version management
        if (installResult.success) {
          installResult.message += '. Consider using npm install -g npm@version to update npm.';
        }
        return [cleanResult, installResult];
      }
      return cleanResult;
    },
    'missing-lockfile': async (cwd: string) => {
      // For missing lockfile, we just need to reinstall dependencies to generate it
      return await CleanupFixer.reinstallDependencies(cwd);
    },
    'npm-dependency-drift': async (cwd: string) => {
      const cleanResult = await CleanupFixer.cleanNodeModules(cwd);
      if (cleanResult.success) {
        const installResult = await CleanupFixer.reinstallDependencies(cwd);
        return [cleanResult, installResult];
      }
      return cleanResult;
    },
    'missing-python3': async () => await SystemToolsFixer.installBuildTools(process.platform),
    'missing-make': async () => await SystemToolsFixer.installBuildTools(process.platform),
    'missing-g++': async () => await SystemToolsFixer.installBuildTools(process.platform),
    'missing-vs-build-tools': async () => await SystemToolsFixer.installBuildTools(process.platform),
    'fsevents-non-macos': async (cwd: string) => {
      // Enhanced fix that specifically targets optional dependencies
      return await CleanupFixer.reinstallDependencies(cwd, true);
    },
    // New fix for node-gyp cache issues
    'node-gyp-cache-issue': async (cwd: string) => {
      const cleanCacheResult = await CleanupFixer.cleanNodeGypCache(cwd);
      if (cleanCacheResult.success) {
        const cleanResult = await CleanupFixer.cleanNodeModules(cwd);
        if (cleanResult.success) {
          const installResult = await CleanupFixer.reinstallDependencies(cwd);
          return [cleanCacheResult, cleanResult, installResult];
        }
        return [cleanCacheResult, cleanResult];
      }
      return cleanCacheResult;
    },
    // Generic fallback for build tool issues
    'build-tools-check-failed': async () => await SystemToolsFixer.installBuildTools(process.platform)
  };

  static async fixIssues(issues: Issue[], cwd: string = process.cwd()): Promise<FixResult[]> {
    const results: FixResult[] = [];
    const processedResults = new Set<FixResult>(); // Optimized tracking of processed results
    const attemptedFixes = new Set<string>(); // Track which issues we've attempted to fix
    
    // Sort issues by severity (critical first, then high, medium, low)
    const sortedIssues = [...issues].sort((a, b) => {
      const severityOrder = { 'critical': 4, 'high': 3, 'medium': 2, 'low': 1 };
      return (severityOrder[b.severity] || 0) - (severityOrder[a.severity] || 0);
    });
    
    // Process issues with optimized lookup
    for (const issue of sortedIssues) {
      // Skip if we've already attempted to fix this issue
      if (attemptedFixes.has(issue.id)) {
        continue;
      }
      
      if (!issue.fixAvailable) {
        Logger.log(`No fix available for issue: ${issue.id}`, 'warn');
        continue;
      }
      
      Logger.log(`Attempting to fix issue: ${issue.id}`, 'info');
      attemptedFixes.add(issue.id);
      
      // Use optimized lookup instead of switch statement
      const fixFunction = this.ISSUE_FIX_MAP[issue.id];
      if (fixFunction) {
        try {
          const fixResult = await fixFunction(cwd, issue);
          
          // Handle both single results and arrays of results
          if (Array.isArray(fixResult)) {
            for (const result of fixResult) {
              if (!processedResults.has(result)) {
                results.push(result);
                processedResults.add(result);
              }
            }
          } else {
            if (!processedResults.has(fixResult)) {
              results.push(fixResult);
              processedResults.add(fixResult);
            }
          }
        } catch (error) {
          const errorResult: FixResult = {
            success: false,
            message: `Error fixing issue ${issue.id}: ${error}`,
            fixedIssues: [],
            failedIssues: [issue.id]
          };
          if (!processedResults.has(errorResult)) {
            results.push(errorResult);
            processedResults.add(errorResult);
          }
        }
      } else {
        // Try to find a more general fix function
        const generalFixFunction = this.findGeneralFixFunction(issue);
        if (generalFixFunction) {
          try {
            const fixResult = await generalFixFunction(cwd, issue);
            
            // Handle both single results and arrays of results
            if (Array.isArray(fixResult)) {
              for (const result of fixResult) {
                if (!processedResults.has(result)) {
                  results.push(result);
                  processedResults.add(result);
                }
              }
            } else {
              if (!processedResults.has(fixResult)) {
                results.push(fixResult);
                processedResults.add(fixResult);
              }
            }
          } catch (error) {
            const errorResult: FixResult = {
              success: false,
              message: `Error fixing issue ${issue.id}: ${error}`,
              fixedIssues: [],
              failedIssues: [issue.id]
            };
            if (!processedResults.has(errorResult)) {
              results.push(errorResult);
              processedResults.add(errorResult);
            }
          }
        } else {
          const unimplementedResult: FixResult = {
            success: false,
            message: `No fix implemented for issue: ${issue.id}`,
            fixedIssues: [],
            failedIssues: [issue.id]
          };
          Logger.log(`No fix implemented for issue: ${issue.id}`, 'warn');
          if (!processedResults.has(unimplementedResult)) {
            results.push(unimplementedResult);
            processedResults.add(unimplementedResult);
          }
        }
      }
    }
    
    return results;
  }
  
  // Helper method to find general fix functions for issues not explicitly mapped
  private static findGeneralFixFunction(issue: Issue): ((cwd: string, issue?: Issue) => Promise<FixResult | FixResult[]>) | null {
    // Handle issues related to build tools with a general approach
    if (issue.id.includes('missing-') && (issue.id.includes('build') || issue.id.includes('tool'))) {
      return async () => await SystemToolsFixer.installBuildTools(process.platform);
    }
    
    // Handle generic dependency issues
    if (issue.id.includes('dependency') || issue.id.includes('module')) {
      return async (cwd: string) => {
        const cleanResult = await CleanupFixer.cleanNodeModules(cwd);
        if (cleanResult.success) {
          const installResult = await CleanupFixer.reinstallDependencies(cwd);
          return [cleanResult, installResult];
        }
        return cleanResult;
      };
    }
    
    // Handle node-gyp related issues
    if (issue.id.includes('node-gyp')) {
      return async (cwd: string) => {
        const cleanCacheResult = await CleanupFixer.cleanNodeGypCache(cwd);
        if (cleanCacheResult.success) {
          const cleanResult = await CleanupFixer.cleanNodeModules(cwd);
          if (cleanResult.success) {
            const installResult = await CleanupFixer.reinstallDependencies(cwd);
            return [cleanCacheResult, cleanResult, installResult];
          }
          return [cleanCacheResult, cleanResult];
        }
        return cleanCacheResult;
      };
    }
    
    return null;
  }
}