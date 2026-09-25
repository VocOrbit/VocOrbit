import type { RedisClient } from "bun";

export type RequestLockStore = {
  acquire(key: string, ownerToken: string, ttlMs: number): Promise<boolean>;
  renew(key: string, ownerToken: string, ttlMs: number): Promise<boolean>;
  release(key: string, ownerToken: string): Promise<void>;
};

const RELEASE_SCRIPT = `
if redis.call("GET", KEYS[1]) == ARGV[1] then
  return redis.call("DEL", KEYS[1])
end
return 0
`;

const RENEW_SCRIPT = `
if redis.call("GET", KEYS[1]) == ARGV[1] then
  return redis.call("PEXPIRE", KEYS[1], ARGV[2])
end
return 0
`;

function namespaced(prefix: string, key: string): string {
  return `${prefix}:${key}`;
}

export function createRedisRequestLockStore(
  client: RedisClient,
  prefix = "request-lock",
): RequestLockStore {
  return {
    async acquire(key, ownerToken, ttlMs) {
      const result = await client.send("SET", [
        namespaced(prefix, key),
        ownerToken,
        "NX",
        "PX",
        String(ttlMs),
      ]);
      return String(result).toUpperCase() === "OK";
    },
    async renew(key, ownerToken, ttlMs) {
      const result = await client.send("EVAL", [
        RENEW_SCRIPT,
        "1",
        namespaced(prefix, key),
        ownerToken,
        String(ttlMs),
      ]);
      return Number(result) === 1;
    },
    async release(key, ownerToken) {
      await client.send("EVAL", [RELEASE_SCRIPT, "1", namespaced(prefix, key), ownerToken]);
    },
  };
}

export function createMemoryRequestLockStore(): RequestLockStore {
  const state = new Map<string, { ownerToken: string; expiresAt: number }>();

  function isExpired(item: { ownerToken: string; expiresAt: number }) {
    return item.expiresAt <= Date.now();
  }

  return {
    async acquire(key, ownerToken, ttlMs) {
      const item = state.get(key);
      if (item && !isExpired(item)) return false;
      state.set(key, { ownerToken, expiresAt: Date.now() + ttlMs });
      return true;
    },
    async renew(key, ownerToken, ttlMs) {
      const item = state.get(key);
      if (!item || isExpired(item) || item.ownerToken !== ownerToken) return false;
      item.expiresAt = Date.now() + ttlMs;
      state.set(key, item);
      return true;
    },
    async release(key, ownerToken) {
      const item = state.get(key);
      if (!item) return;
      if (item.ownerToken !== ownerToken) return;
      state.delete(key);
    },
  };
}
