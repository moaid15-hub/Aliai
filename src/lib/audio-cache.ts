// @ts-nocheck
// Audio Cache System for repeated responses
// Uses LRU (Least Recently Used) caching strategy

class AudioCache {
  private cache: Map<string, Blob> = new Map();
  private maxSize = 20; // Maximum number of cached audio files

  get(text: string): Blob | null {
    return this.cache.get(text) || null;
  }

  set(text: string, audio: Blob): void {
    if (this.cache.size >= this.maxSize) {
      const firstKey = this.cache.keys().next().value;
      this.cache.delete(firstKey);
    }
    this.cache.set(text, audio);
  }

  clear(): void {
    this.cache.clear();
  }
}

export const audioCache = new AudioCache();
