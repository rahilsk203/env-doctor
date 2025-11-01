import { NativeInfo, Issue } from '../types';
import { existsSync, readdirSync, readFileSync, accessSync, constants } from 'fs';
import { join } from 'path';

export async function scanNative(): Promise<NativeInfo & { issues?: Issue[] }> {
  const info: NativeInfo & { issues?: Issue[] } = {
    nodeGypIssues: false, // Would need to implement actual check
    prebuildIssues: false, // Would need to implement actual check
    cmakeJsIssues: false, // Would need to implement actual check
    issues: []
  };

  // Check for Rollup Android ARM64 issue in Termux environments
  const rollupArm64Issue = await checkRollupAndroidArm64Issue();
  if (rollupArm64Issue) {
    info.issues = info.issues || [];
    info.issues.push(rollupArm64Issue);
  }

  // In a real implementation, we would check for other native module issues
  // For now, we'll just return the basic structure

  return info;
}

export async function checkRollupAndroidArm64Issue(): Promise<Issue | null> {
  // Check if we're in a Termux environment
  const isTermux = process.env.PREFIX && process.env.PREFIX.includes('com.termux');
  if (!isTermux) {
    return null;
  }

  // Check if we're on ARM64 architecture
  const isArm64 = process.arch === 'arm64';
  if (!isArm64) {
    return null;
  }

  // Check if node_modules directory exists
  const nodeModulesPath = join(process.cwd(), 'node_modules');
  if (!existsSync(nodeModulesPath)) {
    return null;
  }

  // Check if rollup is installed
  const rollupPath = join(nodeModulesPath, 'rollup');
  if (!existsSync(rollupPath)) {
    return null;
  }

  // Check if @rollup/rollup-android-arm64 is installed
  const rollupAndroidArm64Path = join(nodeModulesPath, '@rollup', 'rollup-android-arm64');
  if (!existsSync(rollupAndroidArm64Path)) {
    return null;
  }

  // Advanced detection: Check for actual error patterns
  const hasError = await detectRollupErrorPattern(rollupAndroidArm64Path);
  
  if (hasError) {
    return {
      id: 'rollup-android-arm64-issue',
      type: 'native-modules',
      severity: 'critical',
      message: 'Rollup Android ARM64 binary issue detected in Termux environment. This is a known issue with Vite projects where the @rollup/rollup-android-arm64 binary fails to load due to missing symbols (__emutls_get_address).',
      fixAvailable: true,
      fixCommand: 'rm -rf node_modules package-lock.json && npm install --force'
    };
  }

  // Fallback detection: If we're in Termux ARM64 with rollup-android-arm64, assume potential issue
  return {
    id: 'rollup-android-arm64-potential-issue',
    type: 'native-modules',
    severity: 'medium',
    message: 'Potential Rollup Android ARM64 binary issue detected in Termux environment. This is a known issue with Vite projects that may cause runtime errors.',
    fixAvailable: true,
    fixCommand: 'rm -rf node_modules package-lock.json && npm install --force'
  };
}

async function detectRollupErrorPattern(rollupAndroidArm64Path: string): Promise<boolean> {
  try {
    // Check if the node binary file exists
    const nodeBinaryPath = join(rollupAndroidArm64Path, 'rollup.android-arm64.node');
    if (!existsSync(nodeBinaryPath)) {
      return false;
    }

    // Try to access the file to see if it's readable
    try {
      accessSync(nodeBinaryPath, constants.R_OK);
    } catch {
      // If we can't read the file, it might be corrupted
      return true;
    }

    // In a real implementation, we would actually try to load the module
    // and catch the specific error. For now, we'll return false to indicate
    // we can't definitively detect the error without actually loading it.
    return false;
  } catch (error) {
    // If there's any error accessing the files, it might indicate an issue
    return true;
  }
}