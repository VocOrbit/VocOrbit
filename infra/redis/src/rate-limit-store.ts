import type { RedisClient } from "bun";
import type { RateLimitStore } from "../../../packages/core/src/http/middleware/rate-limit";

export function createRedisRateLimitStore(client: RedisClient, prefix = "rate"): RateLimitStore {
  return {
    async increment(key: string, windowMs: number) {
      const namespaced = `${prefix}:${key}`;
      const count = await client.incr(namespaced);
      if (count === 1) {
        await client.send("PEXPIRE", [namespaced, String(windowMs)]);
      }
      return Number(count);
    },
  };
}
