import { Issue, FixResult } from '../types';
import { CleanupFixer } from './cleanup';
import { SystemToolsFixer } from './system-tools';
import { Logger } from '../utils/logger';

export class Fixer {
  // Optimized mapping of issue IDs to their fix functions
  private static readonly ISSUE_FIX_MAP: { [key: string]: (cwd: string) => Promise<FixResult | FixResult[]> } = {
    'missing-node-modules': async (cwd: string) => {
      const cleanResult = await CleanupFixer.cleanNodeModules(cwd);
      if (cleanResult.success) {
        const installResult = await CleanupFixer.reinstallDependencies(cwd);
        return [cleanResult, installResult];
      }
      return cleanResult;
    },
    'node-version-mismatch': async (cwd: string) => {
      const cleanResult = await CleanupFixer.cleanNodeModules(cwd);
      if (cleanResult.success) {
        const installResult = await CleanupFixer.reinstallDependencies(cwd);
        return [cleanResult, installResult];
      }
      return cleanResult;
    },
    'node-engine-mismatch': async (cwd: string) => {
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
    'fsevents-non-macos': async (cwd: string) => await CleanupFixer.reinstallDependencies(cwd, true)
  };

  static async fixIssues(issues: Issue[], cwd: string = process.cwd()): Promise<FixResult[]> {
    const results: FixResult[] = [];
    const processedResults = new Set<FixResult>(); // Optimized tracking of processed results
    
    // Process issues with optimized lookup
    for (const issue of issues) {
      if (!issue.fixAvailable) {
        Logger.log(`No fix available for issue: ${issue.id}`, 'warn');
        continue;
      }
      
      Logger.log(`Attempting to fix issue: ${issue.id}`, 'info');
      
      // Use optimized lookup instead of switch statement
      const fixFunction = this.ISSUE_FIX_MAP[issue.id];
      if (fixFunction) {
        try {
          const fixResult = await fixFunction(cwd);
          
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
    
    return results;
  }
}