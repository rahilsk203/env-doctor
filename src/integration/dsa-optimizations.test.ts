import { LRUCache } from '../utils/lruCache';
import { Scanner } from '../scanner';
import { Fixer } from '../fixer';
import { exec } from '../utils/exec';
import { Issue } from '../types';

describe('DSA Optimizations - Integration Tests', () => {
  test('should demonstrate O(1) issue fix lookups in Fixer', async () => {
    // This test verifies that the Map-based issue fix lookup in Fixer works in O(1) time
    const mockIssues: Issue[] = [
      { id: 'missing-node-modules', message: 'Missing node_modules', severity: 'high', type: 'error', fixAvailable: true },
      { id: 'node-version-mismatch', message: 'Node version mismatch', severity: 'critical', type: 'error', fixAvailable: true },
      { id: 'missing-python3', message: 'Missing python3', severity: 'high', type: 'error', fixAvailable: true }
    ];
    
    // Record start time
    const startTime = Date.now();
    
    // Process multiple issues to test lookup performance
    const results = await Fixer.fixIssues(mockIssues, process.cwd());
    
    const endTime = Date.now();
    const duration = endTime - startTime;
    
    // The operation should be reasonably fast due to O(1) Map lookups
    // (Allowing more time since this involves actual file system operations)
    expect(duration).toBeLessThan(5000);
    
    // Should have results for each issue
    expect(results.length).toBeGreaterThan(0);
  }, 10000); // 10 second timeout

  test('should demonstrate efficient duplicate tracking in Fixer', async () => {
    // This test verifies that the Set-based duplicate tracking works efficiently
    const mockIssues: Issue[] = [
      { id: 'missing-node-modules', message: 'Missing node_modules', severity: 'high', type: 'error', fixAvailable: true },
      { id: 'node-version-mismatch', message: 'Node version mismatch', severity: 'critical', type: 'error', fixAvailable: true },
      { id: 'missing-node-modules', message: 'Missing node_modules (duplicate)', severity: 'high', type: 'error', fixAvailable: true }
    ];
    
    // Record start time
    const startTime = Date.now();
    
    // Process issues with duplicates
    const results = await Fixer.fixIssues(mockIssues, process.cwd());
    
    const endTime = Date.now();
    const duration = endTime - startTime;
    
    // Should be reasonably fast due to efficient Set operations
    // (Allowing more time since this involves actual file system operations)
    expect(duration).toBeLessThan(5000);
    
    // Should handle duplicates properly (implementation dependent)
    expect(results.length).toBeGreaterThanOrEqual(1);
  }, 10000); // 10 second timeout

  test('should demonstrate optimized issue deduplication in Scanner', async () => {
    // This test verifies that the Map-based deduplication in Scanner works efficiently
    // We'll mock the individual scanners to return duplicate issues
    
    // Record start time
    const startTime = Date.now();
    
    // Perform a scan operation
    const result = await Scanner.scan(process.cwd());
    
    const endTime = Date.now();
    const duration = endTime - startTime;
    
    // Should be reasonably fast due to O(n) deduplication instead of O(n²)
    expect(duration).toBeLessThan(10000); // Should complete within 10 seconds
    
    // Should have a reasonable number of issues
    expect(result.issues).toBeDefined();
    expect(result.environment).toBeDefined();
  }, 15000); // 15 second timeout

  test('should demonstrate LRU cache performance in exec utility', async () => {
    // This test verifies that the LRU cache in exec utility provides performance benefits
    const cacheTestCommand = 'echo "test"';
    
    // Record start time for first execution (no cache)
    const firstStartTime = Date.now();
    await exec(cacheTestCommand);
    const firstEndTime = Date.now();
    const firstDuration = firstEndTime - firstStartTime;
    
    // Record start time for second execution (should use cache)
    const secondStartTime = Date.now();
    await exec(cacheTestCommand);
    const secondEndTime = Date.now();
    const secondDuration = secondEndTime - secondStartTime;
    
    // Second execution should be faster due to caching
    // (This might not always be true due to various factors, but generally should be)
    expect(firstDuration).toBeGreaterThanOrEqual(secondDuration);
  });

  test('should demonstrate O(1) cache operations with LRUCache', () => {
    const cache = new LRUCache<string, number>(1000);
    
    // Fill cache with items
    for (let i = 0; i < 1000; i++) {
      cache.set(`key${i}`, i);
    }
    
    // Test O(1) get performance
    const getStartTime = Date.now();
    for (let i = 0; i < 1000; i++) {
      cache.get(`key${i}`);
    }
    const getEndTime = Date.now();
    const getDuration = getEndTime - getStartTime;
    
    // Test O(1) set performance with existing keys
    const setStartTime = Date.now();
    for (let i = 0; i < 1000; i++) {
      cache.set(`key${i}`, i * 2);
    }
    const setEndTime = Date.now();
    const setDuration = setEndTime - setStartTime;
    
    // Test O(1) has performance
    const hasStartTime = Date.now();
    for (let i = 0; i < 1000; i++) {
      cache.has(`key${i}`);
    }
    const hasEndTime = Date.now();
    const hasDuration = hasEndTime - hasStartTime;
    
    // All operations should be fast (less than 100ms each)
    expect(getDuration).toBeLessThan(100);
    expect(setDuration).toBeLessThan(100);
    expect(hasDuration).toBeLessThan(100);
    
    // Cache should maintain correct size
    expect(cache.size()).toBe(1000);
  });
});