#!/usr/bin/env node

import { Command } from './utils/commander';
import { colorize } from './utils/colors';
import { Scanner } from './scanner';
import { Fixer } from './fixer';
import { CacheManager } from './utils/cache';
import { Logger } from './utils/logger';
import { ErrorHandler } from './utils/errorHandler';

const program = new Command();

program
  .name('env-doctor')
  .description('Intelligent diagnostic and repair tool for JavaScript/TypeScript development environments')
  .version('1.0.0');

program
  .command('scan')
  .description('Run full diagnostic, show color-coded report')
  .option('-v, --verbose', 'Enable verbose logging')
  .action(async (options: any) => {
    Logger.verboseMode = options.verbose || false;
    console.log(colorize.blue('Running environment scan...'));
    
    try {
      const result = await Scanner.scan();
      console.log(colorize.green(`Scan completed with ${result.issues.length} issues found`));
      
      // Save report to cache
      await CacheManager.saveReport(result);
      
      // Display issues
      if (result.issues.length > 0) {
        console.log('\nIssues found:');
        for (const issue of result.issues) {
          const color = issue.type === 'error' ? colorize.red : 
                        issue.type === 'warning' ? colorize.yellow : colorize.blue;
          console.log(`  ${color('•')} ${issue.message} ${issue.fixAvailable ? colorize.green('(fix available)') : ''}`);
        }
      }
      
      // Display suggestions
      if (result.suggestions.length > 0) {
        console.log('\nSuggestions:');
        for (const suggestion of result.suggestions) {
          console.log(`  ${colorize.cyan('•')} ${suggestion.title}: ${suggestion.description}`);
        }
      }
    } catch (error) {
      ErrorHandler.handleCriticalError(error, {
        message: `Scan failed: ${error}`,
        recoverySuggestion: 'Try running the command again or check your environment setup'
      });
    }
  });

program
  .command('fix')
  .description('Auto-apply safe fixes (prompt for risky ones)')
  .option('--all', 'Non-interactive mode (for CI)')
  .option('-v, --verbose', 'Enable verbose logging')
  .action(async (options: any) => {
    Logger.verboseMode = options.verbose || false;
    console.log(colorize.green('Applying fixes...'));
    
    try {
      // Load last scan report
      const report = await CacheManager.loadReport();
      if (!report) {
        console.log(colorize.yellow('No previous scan found. Running scan first...'));
        const result = await Scanner.scan();
        await CacheManager.saveReport(result);
        
        if (result.issues.length === 0) {
          console.log(colorize.green('No issues found. Environment is healthy!'));
          return;
        }
        
        // Apply fixes
        const fixResults = await Fixer.fixIssues(result.issues);
        displayFixResults(fixResults);
      } else {
        if (report.issues.length === 0) {
          console.log(colorize.green('No issues found in last scan. Environment is healthy!'));
          return;
        }
        
        // Apply fixes
        const fixResults = await Fixer.fixIssues(report.issues);
        displayFixResults(fixResults);
      }
    } catch (error) {
      console.error(colorize.red(`Fix failed: ${error}`));
      process.exit(1);
    }
  });

program
  .command('report')
  .description('View last scan (from .envdoctor/report.json)')
  .option('-v, --verbose', 'Enable verbose logging')
  .action(async (options) => {
    Logger.verboseMode = options.verbose || false;
    console.log(colorize.yellow('Displaying last scan report...'));
    
    try {
      const report = await CacheManager.loadReport();
      if (!report) {
        console.log(colorize.yellow('No previous scan report found.'));
        return;
      }
      
      console.log(colorize.blue(`\nScan performed on: ${report.timestamp}`));
      console.log(colorize.blue(`OS: ${report.environment.os} (${report.environment.arch})`));
      console.log(colorize.blue(`Node.js: ${report.environment.nodeVersion}`));
      console.log(colorize.blue(`npm: ${report.environment.npmVersion}`));
      
      if (report.issues.length > 0) {
        console.log('\nIssues found:');
        for (const issue of report.issues) {
          const color = issue.type === 'error' ? colorize.red : 
                        issue.type === 'warning' ? colorize.yellow : colorize.blue;
          console.log(`  ${color('•')} ${issue.message} ${issue.fixAvailable ? colorize.green('(fix available)') : ''}`);
        }
      } else {
        console.log(colorize.green('\nNo issues found. Environment is healthy!'));
      }
      
      if (report.suggestions.length > 0) {
        console.log('\nSuggestions:');
        for (const suggestion of report.suggestions) {
          console.log(`  ${colorize.cyan('•')} ${suggestion.title}: ${suggestion.description}`);
        }
      }
    } catch (error) {
      console.error(colorize.red(`Failed to load report: ${error}`));
      process.exit(1);
    }
  });

program
  .command('reset')
  .description('Clear cache, logs, and reports')
  .option('-v, --verbose', 'Enable verbose logging')
  .action(async (options) => {
    Logger.verboseMode = options.verbose || false;
    console.log(colorize.red('Resetting env-doctor cache...'));
    
    try {
      await CacheManager.clearCache();
      console.log(colorize.green('Cache cleared successfully!'));
    } catch (error) {
      console.error(colorize.red(`Failed to clear cache: ${error}`));
      process.exit(1);
    }
  });

program
  .command('doctor')
  .description('Easter egg: "How can I help you today?"')
  .action(() => {
    console.log(colorize.magenta('Hello! I\'m env-doctor. How can I help you today?'));
    console.log(colorize.cyan('Try running: env-doctor scan'));
  });

program.parse();

// Helper method to display fix results
function displayFixResults(fixResults: any[]) {
  let successCount = 0;
  let failureCount = 0;
  
  for (const result of fixResults) {
    if (result.success) {
      console.log(colorize.green(`✓ ${result.message}`));
      successCount++;
    } else {
      console.log(colorize.red(`✗ ${result.message}`));
      failureCount++;
    }
  }
  
  console.log(colorize.blue(`\nFix Summary: ${successCount} succeeded, ${failureCount} failed`));
}