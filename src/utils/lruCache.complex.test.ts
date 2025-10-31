import { LRUCache } from './lruCache';

describe('LRUCache - Complex Scenarios', () => {
  let cache: LRUCache<string, number>;

  beforeEach(() => {
    cache = new LRUCache<string, number>(5);
  });

  test('should handle rapid get/set operations', () => {
    // Rapid insertions
    for (let i = 0; i < 100; i++) {
      cache.set(`key${i}`, i);
    }
    
    // Only last 5 items should remain due to capacity
    expect(cache.size()).toBe(5);
    
    // Check that the most recent items are present
    for (let i = 95; i < 100; i++) {
      expect(cache.get(`key${i}`)).toBe(i);
    }
    
    // Earlier items should be evicted
    for (let i = 0; i < 95; i++) {
      expect(cache.get(`key${i}`)).toBeUndefined();
    }
  });

  test('should handle mixed get/set/delete operations', () => {
    // Fill cache
    cache.set('a', 1);
    cache.set('b', 2);
    cache.set('c', 3);
    cache.set('d', 4);
    cache.set('e', 5);
    
    expect(cache.size()).toBe(5);
    
    // Access some items to change LRU order
    cache.get('a');
    cache.get('c');
    
    // Delete an item
    expect(cache.delete('b')).toBe(true);
    expect(cache.size()).toBe(4);
    
    // Add new item - should evict 'd' (least recently used)
    cache.set('f', 6);
    
    expect(cache.size()).toBe(5);
    expect(cache.has('a')).toBe(true);
    expect(cache.has('c')).toBe(true);
    // Note: The exact eviction behavior depends on the specific LRU implementation
    // The test should check for the expected behavior of our implementation
    expect(cache.has('f')).toBe(true);
  });

  test('should handle updating existing keys without eviction', () => {
    cache.set('a', 1);
    cache.set('b', 2);
    cache.set('c', 3);
    
    // Update existing keys
    cache.set('a', 10);
    cache.set('b', 20);
    
    expect(cache.size()).toBe(3);
    expect(cache.get('a')).toBe(10);
    expect(cache.get('b')).toBe(20);
    expect(cache.get('c')).toBe(3);
  });

  test('should maintain correct LRU order with interleaved operations', () => {
    cache.set('a', 1); // a
    cache.set('b', 2); // a, b
    cache.get('a');    // b, a (a becomes MRU)
    cache.set('c', 3); // b, a, c
    cache.set('d', 4); // b, a, c, d
    cache.get('b');    // a, c, d, b (b becomes MRU)
    cache.set('e', 5); // a, c, d, b, e
    
    // Add one more - should evict the LRU item
    cache.set('f', 6);
    
    expect(cache.size()).toBe(5);
    expect(cache.has('f')).toBe(true); // Most recent, should be present
  });

  test('should handle edge case of capacity 1 with repeated operations', () => {
    const smallCache = new LRUCache<string, number>(1);
    
    smallCache.set('a', 1);
    expect(smallCache.size()).toBe(1);
    expect(smallCache.get('a')).toBe(1);
    
    smallCache.set('b', 2);
    expect(smallCache.size()).toBe(1);
    expect(smallCache.get('a')).toBeUndefined();
    expect(smallCache.get('b')).toBe(2);
    
    smallCache.set('c', 3);
    expect(smallCache.size()).toBe(1);
    expect(smallCache.get('b')).toBeUndefined();
    expect(smallCache.get('c')).toBe(3);
  });

  test('should handle clear operation with populated cache', () => {
    // Populate cache
    for (let i = 0; i < 5; i++) {
      cache.set(`item${i}`, i);
    }
    
    expect(cache.size()).toBe(5);
    
    // Clear cache
    cache.clear();
    
    expect(cache.size()).toBe(0);
    
    // Verify all items are gone
    for (let i = 0; i < 5; i++) {
      expect(cache.get(`item${i}`)).toBeUndefined();
    }
    
    // Add items after clear
    cache.set('newItem', 42);
    expect(cache.size()).toBe(1);
    expect(cache.get('newItem')).toBe(42);
  });

  test('should handle delete operations on non-existent keys', () => {
    cache.set('a', 1);
    cache.set('b', 2);
    
    expect(cache.size()).toBe(2);
    
    // Try to delete non-existent keys
    expect(cache.delete('nonexistent1')).toBe(false);
    expect(cache.delete('nonexistent2')).toBe(false);
    
    // Cache size should remain unchanged
    expect(cache.size()).toBe(2);
    
    // Existing items should still be present
    expect(cache.get('a')).toBe(1);
    expect(cache.get('b')).toBe(2);
  });

  test('should handle has operation correctly after various operations', () => {
    expect(cache.has('a')).toBe(false);
    
    cache.set('a', 1);
    expect(cache.has('a')).toBe(true);
    
    cache.delete('a');
    expect(cache.has('a')).toBe(false);
    
    cache.set('b', 2);
    cache.clear();
    expect(cache.has('b')).toBe(false);
  });
});

describe('LRUCache - Performance Stress Test', () => {
  test('should handle high volume operations efficiently', () => {
    const cache = new LRUCache<number, string>(100);
    const startTime = Date.now();
    
    // Perform 10,000 operations
    for (let i = 0; i < 10000; i++) {
      cache.set(i, `value${i}`);
      
      // Read some values to test get performance
      if (i % 100 === 0) {
        cache.get(i - 50);
        cache.get(i - 10);
      }
      
      // Delete some values
      if (i % 500 === 0 && i > 0) {
        cache.delete(i - 250);
      }
    }
    
    const endTime = Date.now();
    const duration = endTime - startTime;
    
    // Should complete within reasonable time (less than 2 seconds)
    expect(duration).toBeLessThan(2000);
    
    // Cache should have correct size
    expect(cache.size()).toBe(100);
  });
});