/**
 * Fixed-capacity circular buffer. O(1) push, O(n) flush.
 * Oldest entry is overwritten when capacity is exceeded — no memory growth.
 * Used for bounding price-history arrays per ticker.
 */
export class RingBuffer {
  constructor(capacity) {
    this.capacity = capacity;
    this.buffer = new Array(capacity);
    this.head = 0;   // next write position
    this.size = 0;
  }

  push(item) {
    this.buffer[this.head] = item;
    this.head = (this.head + 1) % this.capacity;
    if (this.size < this.capacity) this.size++;
  }

  toArray() {
    if (this.size === 0) return [];
    const start = this.size < this.capacity ? 0 : this.head;
    const result = new Array(this.size);
    for (let i = 0; i < this.size; i++) {
      result[i] = this.buffer[(start + i) % this.capacity];
    }
    return result;
  }

  get length() {
    return this.size;
  }

  clear() {
    this.head = 0;
    this.size = 0;
  }
}
