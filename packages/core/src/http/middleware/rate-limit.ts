import { Elysia } from "elysia";
import { RateLimitError } from "../../errors";
import type { MetricsRegistry } from "./metrics";

export type RateLimitOptions = {
  windowMs: number;
  max: number;
  trustProxy: boolean;
  metrics?: MetricsRegistry;
  store?: RateLimitStore;
  resolveUserId?: (request: Request) => Promise<string | undefined>;
};

export type RateLimitStore = {
  increment(key: string, windowMs: number): Promise<number>;
};

function createMemoryStore(): RateLimitStore {
  const store = new Map<string, { start: number; count: number }>();

  return {
    async increment(key: string, windowMs: number) {
      const now = Date.now();
      const entry = store.get(key);
      if (!entry || now - entry.start > windowMs) {
        store.set(key, { start: now, count: 1 });
        return 1;
      }
      entry.count += 1;
      return entry.count;
    },
  };
}

export function createRateLimitPlugin(options: RateLimitOptions) {
  const store = options.store ?? createMemoryStore();

  function normalizeIpCandidate(value: string | null): string | undefined {
    if (!value) return undefined;
    const first = value.split(",")[0]?.trim();
    if (!first) return undefined;
    if (!/^[a-zA-Z0-9:.]+$/.test(first)) return undefined;
    return first.toLowerCase();
  }

  function resolveIp(request: Request): string {
    if (!options.trustProxy) {
      return "untrusted";
    }

    const fromRealIp = normalizeIpCandidate(request.headers.get("x-real-ip"));
    if (fromRealIp) return fromRealIp;

    const fromForwardedFor = normalizeIpCandidate(request.headers.get("x-forwarded-for"));
    if (fromForwardedFor) return fromForwardedFor;

    return "proxy-ip-unknown";
  }

  async function resolveUserSegment(request: Request): Promise<string> {
    if (!options.resolveUserId) return "anonymous";
    try {
      const userId = await options.resolveUserId(request);
      const normalized = userId?.trim();
      if (!normalized) return "anonymous";
      return normalized;
    } catch {
      return "anonymous";
    }
  }

  async function buildKey(request: Request): Promise<string> {
    const ip = resolveIp(request);
    const user = await resolveUserSegment(request);
    return `ip:${ip}|user:${user}`;
  }

  return new Elysia({ name: "rate-limit" })
    .onBeforeHandle(async ({ request }) => {
      const key = await buildKey(request);
      const count = await store.increment(key, options.windowMs);

      if (count > options.max) {
        options.metrics?.incRateLimited();
        throw new RateLimitError();
      }
    })
    .as("global");
}
