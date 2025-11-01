import { execCommand } from '../utils/exec';
import { existsSync } from 'fs';
import { join } from 'path';

/**
 * Fix for Rollup Android ARM64 issue in Termux environments
 * This is a known issue with Vite projects where the @rollup/rollup-android-arm64
 * binary fails to load due to missing symbols.
 * 
 * Solution: Clean node_modules and force reinstall dependencies
 */
export async function fixRollupAndroidArm64Issue(): Promise<boolean> {
  try {
    // Check if we're in a Termux environment
    const isTermux = process.env.PREFIX && process.env.PREFIX.includes('com.termux');
    if (!isTermux) {
      console.log('Not in Termux environment, skipping Rollup ARM64 fix');
      return false;
    }

    // Check if we're on ARM64 architecture
    const isArm64 = process.arch === 'arm64';
    if (!isArm64) {
      console.log('Not on ARM64 architecture, skipping Rollup ARM64 fix');
      return false;
    }

    console.log('Detected Termux ARM64 environment, applying Rollup Android ARM64 fix...');
    
    // Remove node_modules and package-lock.json
    const nodeModulesPath = join(process.cwd(), 'node_modules');
    const packageLockPath = join(process.cwd(), 'package-lock.json');
    const yarnLockPath = join(process.cwd(), 'yarn.lock');
    const pnpmLockPath = join(process.cwd(), 'pnpm-lock.yaml');
    
    if (existsSync(nodeModulesPath)) {
      console.log('Removing node_modules directory...');
      await execCommand('rm -rf node_modules');
    }
    
    if (existsSync(packageLockPath)) {
      console.log('Removing package-lock.json...');
      await execCommand('rm package-lock.json');
    }
    
    if (existsSync(yarnLockPath)) {
      console.log('Removing yarn.lock...');
      await execCommand('rm yarn.lock');
    }
    
    if (existsSync(pnpmLockPath)) {
      console.log('Removing pnpm-lock.yaml...');
      await execCommand('rm pnpm-lock.yaml');
    }
    
    // Reinstall dependencies
    console.log('Reinstalling dependencies with force flag...');
    await execCommand('npm install --force');
    
    console.log('Rollup Android ARM64 fix applied successfully!');
    return true;
  } catch (error) {
    console.error('Failed to fix Rollup Android ARM64 issue:', error);
    return false;
  }
}