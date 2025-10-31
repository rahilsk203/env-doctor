/**
 * LRU (Least Recently Used) Cache implementation
 * Provides O(1) get and set operations with automatic eviction of least recently used items
 * Uses a doubly linked list and Map for optimal performance
 */
export class LRUCache<K, V> {
  private capacity: number;
  private cache: Map<K, ListNode<K, V>>;
  private head: ListNode<K, V>; // Dummy head node
  private tail: ListNode<K, V>; // Dummy tail node

  constructor(capacity: number) {
    if (capacity <= 0) {
      throw new Error('Capacity must be greater than 0');
    }
    this.capacity = capacity;
    this.cache = new Map<K, ListNode<K, V>>();
    
    // Initialize dummy head and tail nodes for the doubly linked list
    this.head = { key: null as unknown as K, value: null as unknown as V } as ListNode<K, V>;
    this.tail = { key: null as unknown as K, value: null as unknown as V } as ListNode<K, V>;
    this.head.next = this.tail;
    this.tail.prev = this.head;
  }

  /**
   * Get a value from the cache
   * Time Complexity: O(1) average case
   */
  get(key: K): V | undefined {
    const node = this.cache.get(key);
    if (node) {
      // Move accessed node to head (most recently used)
      this.moveToHead(node);
      return node.value;
    }
    return undefined;
  }

  /**
   * Set a value in the cache
   * Time Complexity: O(1) average case
   */
  set(key: K, value: V): void {
    const existingNode = this.cache.get(key);
    if (existingNode) {
      // Update existing node
      existingNode.value = value;
      this.moveToHead(existingNode);
    } else {
      // Add new node
      const newNode: ListNode<K, V> = { key, value };
      
      if (this.cache.size >= this.capacity) {
        // Evict least recently used item (tail)
        const lruNode = this.tail.prev!;
        this.removeNode(lruNode);
        this.cache.delete(lruNode.key);
      }
      
      this.addNode(newNode);
      this.cache.set(key, newNode);
    }
  }

  /**
   * Check if a key exists in the cache
   * Time Complexity: O(1) average case
   */
  has(key: K): boolean {
    return this.cache.has(key);
  }

  /**
   * Delete a key from the cache
   * Time Complexity: O(1) average case
   */
  delete(key: K): boolean {
    const node = this.cache.get(key);
    if (node) {
      this.removeNode(node);
      this.cache.delete(key);
      return true;
    }
    return false;
  }

  /**
   * Clear the cache
   * Time Complexity: O(1)
   */
  clear(): void {
    this.cache.clear();
    this.head.next = this.tail;
    this.tail.prev = this.head;
  }

  /**
   * Get the current size of the cache
   * Time Complexity: O(1)
   */
  size(): number {
    return this.cache.size;
  }

  /**
   * Get the maximum capacity of the cache
   * Time Complexity: O(1)
   */
  getCapacity(): number {
    return this.capacity;
  }

  /**
   * Add a node right after the head (marking it as most recently used)
   * Time Complexity: O(1)
   */
  private addNode(node: ListNode<K, V>): void {
    node.prev = this.head;
    node.next = this.head.next;
    this.head.next!.prev = node;
    this.head.next = node;
  }

  /**
   * Remove a node from the doubly linked list
   * Time Complexity: O(1)
   */
  private removeNode(node: ListNode<K, V>): void {
    node.prev!.next = node.next;
    node.next!.prev = node.prev;
  }

  /**
   * Move a node to the head of the list (marking it as most recently used)
   * Time Complexity: O(1)
   */
  private moveToHead(node: ListNode<K, V>): void {
    this.removeNode(node);
    this.addNode(node);
  }
}

// Doubly linked list node interface
interface ListNode<K, V> {
  key: K;
  value: V;
  prev?: ListNode<K, V>;
  next?: ListNode<K, V>;
}