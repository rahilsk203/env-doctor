import { EnvironmentReport, FixResult } from '../types';
import inquirer from 'inquirer';
import { execCommand } from '../utils/exec';
import { fixRollupAndroidArm64Issue } from './rollup';

export async function fixIssues(report: EnvironmentReport, autoFix: boolean = false): Promise<FixResult> {
  const result: FixResult = {
    success: false,
    message: '',
    fixedIssues: []
  };

  if (!report.issues || report.issues.length === 0) {
    result.message = 'No issues found to fix';
    return result;
  }

  // Filter issues that have fixes available
  const fixableIssues = report.issues.filter(issue => issue.fixAvailable);

  if (fixableIssues.length === 0) {
    result.message = 'No fixable issues found';
    return result;
  }

  // If autoFix is enabled, fix all issues without prompting
  if (autoFix) {
    for (const issue of fixableIssues) {
      try {
        await applyFix(issue);
        result.fixedIssues.push(issue.id);
      } catch (error) {
        console.error(`Failed to fix issue ${issue.id}:`, error);
      }
    }
    result.success = result.fixedIssues.length > 0;
    result.message = `Fixed ${result.fixedIssues.length} issues`;
    return result;
  }

  // Interactive mode - prompt user for each fix
  for (const issue of fixableIssues) {
    const answer = await inquirer.prompt([
      {
        type: 'confirm',
        name: 'apply',
        message: `Fix ${issue.id}: ${issue.message}?`,
        default: true
      }
    ]);

    if (answer.apply) {
      try {
        await applyFix(issue);
        result.fixedIssues.push(issue.id);
      } catch (error) {
        console.error(`Failed to fix issue ${issue.id}:`, error);
      }
    }
  }

  result.success = result.fixedIssues.length > 0;
  result.message = `Fixed ${result.fixedIssues.length} issues`;
  return result;
}

async function applyFix(issue: any): Promise<void> {
  console.log(`Applying fix for ${issue.id}...`);
  
  // Handle specific fixes based on issue ID
  if (issue.id === 'rollup-android-arm64-issue' || issue.id === 'rollup-android-arm64-potential-issue') {
    try {
      const success = await fixRollupAndroidArm64Issue();
      if (!success) {
        throw new Error('Failed to apply Rollup Android ARM64 fix');
      }
      return;
    } catch (error) {
      throw new Error(`Failed to execute Rollup Android ARM64 fix: ${error}`);
    }
  }
  
  // Default fix execution for other issues
  if (issue.fixCommand) {
    try {
      await execCommand(issue.fixCommand);
    } catch (error) {
      throw new Error(`Failed to execute fix command: ${error}`);
    }
  }
}