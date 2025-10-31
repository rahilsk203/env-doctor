import { LRUCache } from './lruCache';

describe('LRUCache', () => {
  let cache: LRUCache<string, number>;

  beforeEach(() => {
    cache = new LRUCache<string, number>(3);
  });

  test('should set and get values correctly', () => {
    cache.set('a', 1);
    cache.set('b', 2);
    cache.set('c', 3);

    expect(cache.get('a')).toBe(1);
    expect(cache.get('b')).toBe(2);
    expect(cache.get('c')).toBe(3);
  });

  test('should return undefined for non-existent keys', () => {
    expect(cache.get('non-existent')).toBeUndefined();
  });

  test('should evict least recently used item when capacity is exceeded', () => {
    cache.set('a', 1);
    cache.set('b', 2);
    cache.set('c', 3);
    
    // Access 'a' to make it recently used
    cache.get('a');
    
    // Add 'd' which should evict 'b' (least recently used)
    cache.set('d', 4);
    
    expect(cache.get('a')).toBe(1);  // Should still be in cache
    expect(cache.get('b')).toBeUndefined();  // Should be evicted
    expect(cache.get('c')).toBe(3);  // Should still be in cache
    expect(cache.get('d')).toBe(4);  // Should be in cache
  });

  test('should update existing key without changing capacity', () => {
    cache.set('a', 1);
    cache.set('b', 2);
    cache.set('c', 3);
    
    // Update existing key
    cache.set('b', 20);
    
    expect(cache.size()).toBe(3);
    expect(cache.get('b')).toBe(20);
  });

  test('should correctly report size and capacity', () => {
    expect(cache.size()).toBe(0);
    expect(cache.getCapacity()).toBe(3);
    
    cache.set('a', 1);
    cache.set('b', 2);
    
    expect(cache.size()).toBe(2);
    expect(cache.getCapacity()).toBe(3);
  });

  test('should correctly handle has method', () => {
    cache.set('a', 1);
    
    expect(cache.has('a')).toBe(true);
    expect(cache.has('b')).toBe(false);
  });

  test('should correctly delete items', () => {
    cache.set('a', 1);
    cache.set('b', 2);
    
    expect(cache.delete('a')).toBe(true);
    expect(cache.has('a')).toBe(false);
    expect(cache.size()).toBe(1);
    
    expect(cache.delete('non-existent')).toBe(false);
  });

  test('should correctly clear all items', () => {
    cache.set('a', 1);
    cache.set('b', 2);
    cache.set('c', 3);
    
    cache.clear();
    
    expect(cache.size()).toBe(0);
    expect(cache.has('a')).toBe(false);
    expect(cache.has('b')).toBe(false);
    expect(cache.has('c')).toBe(false);
  });

  test('should handle edge case of capacity 1', () => {
    const smallCache = new LRUCache<string, number>(1);
    smallCache.set('a', 1);
    smallCache.set('b', 2);
    
    expect(smallCache.size()).toBe(1);
    expect(smallCache.has('a')).toBe(false);
    expect(smallCache.has('b')).toBe(true);
  });
});