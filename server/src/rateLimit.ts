/** Simple token bucket. */
export class TokenBucket {
  private tokens: number;
  private last = Date.now();
  constructor(private capacity: number, private refillPerSec: number) {
    this.tokens = capacity;
  }
  take(n = 1): boolean {
    const t = Date.now();
    this.tokens = Math.min(this.capacity, this.tokens + ((t - this.last) / 1000) * this.refillPerSec);
    this.last = t;
    if (this.tokens < n) return false;
    this.tokens -= n;
    return true;
  }
}

/** Keyed limiter (e.g. per IP) that forgets idle keys. */
export class KeyedLimiter {
  private buckets = new Map<string, { b: TokenBucket; seen: number }>();
  constructor(private capacity: number, private refillPerSec: number) {}
  take(key: string, n = 1) {
    let e = this.buckets.get(key);
    if (!e) {
      e = { b: new TokenBucket(this.capacity, this.refillPerSec), seen: Date.now() };
      this.buckets.set(key, e);
    }
    e.seen = Date.now();
    if (this.buckets.size > 5000) this.sweep();
    return e.b.take(n);
  }
  private sweep() {
    const cutoff = Date.now() - 10 * 60_000;
    for (const [k, v] of this.buckets) if (v.seen < cutoff) this.buckets.delete(k);
  }
}
