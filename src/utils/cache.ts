import { existsSync, rmSync, readdirSync } from 'fs';
import { join } from 'path';

const CACHE_DIR = '.envdoctor';

export async function resetCache(): Promise<void> {
  try {
    if (existsSync(CACHE_DIR)) {
      // Remove all files in the cache directory
      const files = readdirSync(CACHE_DIR);
      for (const file of files) {
        rmSync(join(CACHE_DIR, file));
      }
    }
  } catch (error) {
    throw new Error(`Failed to reset cache: ${error}`);
  }
}