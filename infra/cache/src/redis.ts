import type { RedisClient } from "bun";
import type { Cache } from "../../../packages/core/src/cache";

export function createRedisCache(client: RedisClient, prefix = "cache"): Cache {
  return {
    async get<T>(key: string): Promise<T | undefined> {
      const raw = await client.get(`${prefix}:${key}`);
      if (!raw) return undefined;
      return JSON.parse(raw) as T;
    },
    async set<T>(key: string, value: T, ttlMs?: number) {
      const payload = JSON.stringify(value);
      if (ttlMs) {
        await client.send("PSETEX", [`${prefix}:${key}`, String(ttlMs), payload]);
        return;
      }
      await client.set(`${prefix}:${key}`, payload);
    },
    async delete(key: string) {
      await client.del(`${prefix}:${key}`);
    },
  };
}
