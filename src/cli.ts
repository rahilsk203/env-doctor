#!/usr/bin/env node

import { Command } from 'commander';
import chalk from 'chalk';
import { Scanner } from './scanner';
import { Fixer } from './fixer';
import { CacheManager } from './utils/cache';
import { Logger } from './utils/logger';

const program = new Command();

program
  .name('env-doctor')
  .description('Intelligent diagnostic and repair tool for JavaScript/TypeScript development environments')
  .version('1.0.0');

program
  .command('scan')
  .description('Run full diagnostic, show color-coded report')
  .option('-v, --verbose', 'Enable verbose logging')
  .action(async (options) => {
    Logger.verboseMode = options.verbose || false;
    console.log(chalk.blue('Running environment scan...'));
    
    try {
      const result = await Scanner.scan();
      console.log(chalk.green(`Scan completed with ${result.issues.length} issues found`));
      
      // Save report to cache
      await CacheManager.saveReport(result);
      
      // Display issues
      if (result.issues.length > 0) {
        console.log('\nIssues found:');
        for (const issue of result.issues) {
          const color = issue.type === 'error' ? chalk.red : 
                        issue.type === 'warning' ? chalk.yellow : chalk.blue;
          console.log(`  ${color('•')} ${issue.message} ${issue.fixAvailable ? chalk.green('(fix available)') : ''}`);
        }
      }
      
      // Display suggestions
      if (result.suggestions.length > 0) {
        console.log('\nSuggestions:');
        for (const suggestion of result.suggestions) {
          console.log(`  ${chalk.cyan('•')} ${suggestion.title}: ${suggestion.description}`);
        }
      }
    } catch (error) {
      console.error(chalk.red(`Scan failed: ${error}`));
      process.exit(1);
    }
  });

program
  .command('fix')
  .description('Auto-apply safe fixes (prompt for risky ones)')
  .option('--all', 'Non-interactive mode (for CI)')
  .option('-v, --verbose', 'Enable verbose logging')
  .action(async (options) => {
    Logger.verboseMode = options.verbose || false;
    console.log(chalk.green('Applying fixes...'));
    
    try {
      // Load last scan report
      const report = await CacheManager.loadReport();
      if (!report) {
        console.log(chalk.yellow('No previous scan found. Running scan first...'));
        const result = await Scanner.scan();
        await CacheManager.saveReport(result);
        
        if (result.issues.length === 0) {
          console.log(chalk.green('No issues found. Environment is healthy!'));
          return;
        }
        
        // Apply fixes
        const fixResults = await Fixer.fixIssues(result.issues);
        displayFixResults(fixResults);
      } else {
        if (report.issues.length === 0) {
          console.log(chalk.green('No issues found in last scan. Environment is healthy!'));
          return;
        }
        
        // Apply fixes
        const fixResults = await Fixer.fixIssues(report.issues);
        displayFixResults(fixResults);
      }
    } catch (error) {
      console.error(chalk.red(`Fix failed: ${error}`));
      process.exit(1);
    }
  });

program
  .command('report')
  .description('View last scan (from .envdoctor/report.json)')
  .option('-v, --verbose', 'Enable verbose logging')
  .action(async (options) => {
    Logger.verboseMode = options.verbose || false;
    console.log(chalk.yellow('Displaying last scan report...'));
    
    try {
      const report = await CacheManager.loadReport();
      if (!report) {
        console.log(chalk.yellow('No previous scan report found.'));
        return;
      }
      
      console.log(chalk.blue(`\nScan performed on: ${report.timestamp}`));
      console.log(chalk.blue(`OS: ${report.environment.os} (${report.environment.arch})`));
      console.log(chalk.blue(`Node.js: ${report.environment.nodeVersion}`));
      console.log(chalk.blue(`npm: ${report.environment.npmVersion}`));
      
      if (report.issues.length > 0) {
        console.log('\nIssues found:');
        for (const issue of report.issues) {
          const color = issue.type === 'error' ? chalk.red : 
                        issue.type === 'warning' ? chalk.yellow : chalk.blue;
          console.log(`  ${color('•')} ${issue.message} ${issue.fixAvailable ? chalk.green('(fix available)') : ''}`);
        }
      } else {
        console.log(chalk.green('\nNo issues found. Environment is healthy!'));
      }
      
      if (report.suggestions.length > 0) {
        console.log('\nSuggestions:');
        for (const suggestion of report.suggestions) {
          console.log(`  ${chalk.cyan('•')} ${suggestion.title}: ${suggestion.description}`);
        }
      }
    } catch (error) {
      console.error(chalk.red(`Failed to load report: ${error}`));
      process.exit(1);
    }
  });

program
  .command('reset')
  .description('Clear cache, logs, and reports')
  .option('-v, --verbose', 'Enable verbose logging')
  .action(async (options) => {
    Logger.verboseMode = options.verbose || false;
    console.log(chalk.red('Resetting env-doctor cache...'));
    
    try {
      await CacheManager.clearCache();
      console.log(chalk.green('Cache cleared successfully!'));
    } catch (error) {
      console.error(chalk.red(`Failed to clear cache: ${error}`));
      process.exit(1);
    }
  });

program
  .command('doctor')
  .description('Easter egg: "How can I help you today?"')
  .action(() => {
    console.log(chalk.magenta('Hello! I\'m env-doctor. How can I help you today?'));
    console.log(chalk.cyan('Try running: env-doctor scan'));
  });

program.parse();

// Helper method to display fix results
function displayFixResults(fixResults: any[]) {
  let successCount = 0;
  let failureCount = 0;
  
  for (const result of fixResults) {
    if (result.success) {
      console.log(chalk.green(`✓ ${result.message}`));
      successCount++;
    } else {
      console.log(chalk.red(`✗ ${result.message}`));
      failureCount++;
    }
  }
  
  console.log(chalk.blue(`\nFix Summary: ${successCount} succeeded, ${failureCount} failed`));
}