import { LRUCache } from './lruCache';

describe('LRUCache - Performance Benchmark', () => {
  test('should demonstrate O(1) performance for get/set operations', () => {
    const cache = new LRUCache<number, string>(1000);
    
    // Warm up the cache
    for (let i = 0; i < 1000; i++) {
      cache.set(i, `value${i}`);
    }
    
    // Benchmark get operations
    const getStartTime = Date.now();
    for (let i = 0; i < 10000; i++) {
      cache.get(i % 1000);
    }
    const getEndTime = Date.now();
    const getDuration = getEndTime - getStartTime;
    
    // Benchmark set operations
    const setStartTime = Date.now();
    for (let i = 1000; i < 11000; i++) {
      cache.set(i, `value${i}`);
    }
    const setEndTime = Date.now();
    const setDuration = setEndTime - setStartTime;
    
    // Benchmark delete operations
    const deleteStartTime = Date.now();
    for (let i = 1000; i < 2000; i++) {
      cache.delete(i);
    }
    const deleteEndTime = Date.now();
    const deleteDuration = deleteEndTime - deleteStartTime;
    
    console.log(`LRUCache Performance Benchmark:
      Get operations (10,000): ${getDuration}ms
      Set operations (10,000): ${setDuration}ms
      Delete operations (1,000): ${deleteDuration}ms`);
    
    // These operations should be very fast (less than 100ms each)
    expect(getDuration).toBeLessThan(100);
    expect(setDuration).toBeLessThan(100);
    expect(deleteDuration).toBeLessThan(100);
  });

  test('should maintain consistent performance with cache size', () => {
    // Test with different cache sizes
    const sizes = [100, 500, 1000, 5000];
    const results: { size: number; duration: number }[] = [];
    
    for (const size of sizes) {
      const cache = new LRUCache<number, number>(size);
      
      // Fill cache
      for (let i = 0; i < size; i++) {
        cache.set(i, i);
      }
      
      // Measure access time
      const startTime = Date.now();
      for (let i = 0; i < 1000; i++) {
        cache.get(i % size);
      }
      const endTime = Date.now();
      
      results.push({ size, duration: endTime - startTime });
    }
    
    console.log('LRUCache Performance by Size:', results);
    
    // All operations should be fast regardless of cache size
    for (const result of results) {
      expect(result.duration).toBeLessThan(50);
    }
  });

  test('should handle high-frequency operations without memory leaks', () => {
    const cache = new LRUCache<string, number>(100);
    
    // Perform many operations
    for (let cycle = 0; cycle < 100; cycle++) {
      // Add items
      for (let i = 0; i < 50; i++) {
        cache.set(`key${cycle}-${i}`, i);
      }
      
      // Access items
      for (let i = 0; i < 25; i++) {
        cache.get(`key${cycle}-${i}`);
      }
      
      // Delete some items
      for (let i = 25; i < 50; i += 2) {
        cache.delete(`key${cycle}-${i}`);
      }
    }
    
    // Cache should maintain correct size
    expect(cache.size()).toBeLessThanOrEqual(100);
    
    // Memory usage should not grow unbounded
    // (This is a basic check - real memory leak detection would require more sophisticated tools)
  });
});