import { RedisClient, redis as defaultRedis } from "bun";

export function createRedisClient(redisUrl?: string) {
  if (typeof RedisClient === "function") {
    return new RedisClient(redisUrl);
  }
  if (defaultRedis) {
    return defaultRedis;
  }
  throw new Error("Bun Redis client is not available. Requires Bun >= 1.3");
}
