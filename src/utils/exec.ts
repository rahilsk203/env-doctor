import { exec as childExec } from 'child_process';
import { promisify } from 'util';
import { LRUCache } from './lruCache';

const execPromise = promisify(childExec);

// Enhanced LRU cache for frequently executed commands with 50-item capacity
const commandCache = new LRUCache<string, { result: ExecResult; timestamp: number }>(50);
const CACHE_TTL = 5000; // 5 seconds cache TTL

export interface ExecResult {
  stdout: string;
  stderr: string;
  code: number | null;
}

export async function exec(command: string, options: { cwd?: string; timeout?: number } = {}): Promise<ExecResult> {
  // Check LRU cache for frequently used commands
  const cacheKey = `${command}-${options.cwd || ''}`;
  const cached = commandCache.get(cacheKey);
  
  if (cached && Date.now() - cached.timestamp < CACHE_TTL) {
    return cached.result;
  }
  
  try {
    const { stdout, stderr } = await execPromise(command, {
      cwd: options.cwd,
      timeout: options.timeout || 30000,
      maxBuffer: 1024 * 1024 * 10 // 10MB
    });
    
    const result = { stdout, stderr, code: 0 };
    
    // Cache successful results with LRU eviction
    commandCache.set(cacheKey, { result, timestamp: Date.now() });
    
    return result;
  } catch (error: any) {
    const result = {
      stdout: error.stdout || '',
      stderr: error.stderr || error.message,
      code: error.code || 1
    };
    
    // Cache error results as well to avoid repeated failed calls with LRU eviction
    commandCache.set(cacheKey, { result, timestamp: Date.now() });
    
    return result;
  }
}

// LRU cache automatically handles eviction, no manual cleanup needed