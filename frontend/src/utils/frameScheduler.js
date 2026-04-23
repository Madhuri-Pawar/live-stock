/**
 * Batches incoming stock ticks to the browser's paint cycle via requestAnimationFrame.
 *
 * Problem it solves: WebSocket fires 100 msgs/sec. React can only paint 60fps.
 * Naive setState on every message queues 100 renders/sec → frame budget blown.
 *
 * How it works:
 *   1. Each incoming tick is stored in a Map keyed by ticker.
 *      If the same ticker arrives 10x before the next frame, the Map keeps only the latest.
 *   2. On the next animation frame (~16ms), the Map is flushed in one batch.
 *   3. A single store update per frame — React renders once per frame maximum.
 *
 * Tab hidden: rAF stops firing automatically. Buffer accumulates latest-per-ticker.
 * Tab visible again: next rAF fires, flushes the accumulated latest prices instantly.
 */
export class FrameScheduler {
  constructor(onFlush) {
    this.onFlush = onFlush;
    this.pending = new Map(); // ticker → latest tick data (automatic dedup)
    this.rafId = null;
  }

  schedule(tick) {
    this.pending.set(tick.ticker, tick);

    if (!this.rafId) {
      this.rafId = requestAnimationFrame(this._flush);
    }
  }

  _flush = () => {
    this.rafId = null;
    if (this.pending.size === 0) return;

    const batch = new Map(this.pending);
    this.pending.clear();

    this.onFlush(batch);
  };

  destroy() {
    if (this.rafId) {
      cancelAnimationFrame(this.rafId);
      this.rafId = null;
    }
    this.pending.clear();
  }
}
