#!/usr/bin/env node

import { Command } from 'commander';
import chalk from 'chalk';
import { scanEnvironment } from './scanner';
import { fixIssues } from './fixer';
import { generateReport, loadLastReport } from './utils/report';
import { resetCache } from './utils/cache';
import { Logger } from './utils/logger';

const program = new Command();

program
  .name('env-doctor')
  .description('Intelligent diagnostic and repair tool for JavaScript/TypeScript development environments')
  .version('1.0.0');

program
  .command('scan')
  .description('Run full diagnostic scan of your environment')
  .action(async () => {
    try {
      Logger.info('Scanning environment...');
      const report = await scanEnvironment();
      await generateReport(report);
      Logger.success('Scan completed successfully!');
      Logger.info(`Report saved to .envdoctor/report.json`);
    } catch (error) {
      Logger.error(`Scan failed: ${error}`);
      process.exit(1);
    }
  });

program
  .command('fix')
  .description('Auto-apply safe fixes for detected issues')
  .option('-a, --all', 'Non-interactive mode (for CI)')
  .action(async (options) => {
    try {
      Logger.info('Fixing environment issues...');
      let report = await loadLastReport();
      if (!report) {
        Logger.warn('No previous scan found. Running scan first...');
        const scanReport = await scanEnvironment();
        await generateReport(scanReport);
        report = scanReport;
      }
      
      if (report) {
        const fixed = await fixIssues(report, options.all);
        if (fixed.success) {
          Logger.success('Environment fixed successfully!');
        } else {
          Logger.warn('No issues to fix or fix cancelled.');
        }
      }
    } catch (error) {
      Logger.error(`Fix failed: ${error}`);
      process.exit(1);
    }
  });

program
  .command('report')
  .description('View last scan report')
  .action(async () => {
    try {
      const report = await loadLastReport();
      if (!report) {
        Logger.warn('No previous scan report found. Run "env-doctor scan" first.');
        return;
      }
      
      Logger.info('Last Scan Report:');
      console.log(JSON.stringify(report, null, 2));
    } catch (error) {
      Logger.error(`Failed to load report: ${error}`);
      process.exit(1);
    }
  });

program
  .command('reset')
  .description('Clear cache, logs, and reports')
  .action(async () => {
    try {
      await resetCache();
      Logger.success('Cache, logs, and reports cleared successfully!');
    } catch (error) {
      Logger.error(`Reset failed: ${error}`);
      process.exit(1);
    }
  });

program
  .command('doctor')
  .description('Easter egg: "How can I help you today?"')
  .action(() => {
    console.log(chalk.green('👨‍⚕️ Hello! I\'m env-doctor. How can I help you today?'));
    Logger.info('Try "env-doctor scan" to diagnose your environment.');
  });

program.parse();