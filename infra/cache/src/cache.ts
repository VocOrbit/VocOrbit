export type CacheValue<T> = { value: T; expiresAt?: number };

export function createMemoryCache<T>() {
  const store = new Map<string, CacheValue<T>>();

  return {
    async get(key: string): Promise<T | undefined> {
      const entry = store.get(key);
      if (!entry) return undefined;
      if (entry.expiresAt && entry.expiresAt < Date.now()) {
        store.delete(key);
        return undefined;
      }
      return entry.value;
    },
    async set(key: string, value: T, ttlMs?: number) {
      const expiresAt = ttlMs ? Date.now() + ttlMs : undefined;
      store.set(key, { value, expiresAt });
    },
    async delete(key: string) {
      store.delete(key);
    },
  };
}
