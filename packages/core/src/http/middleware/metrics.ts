import { Elysia } from "elysia";

const latencyBuckets = [50, 100, 250, 500, 1000, 2500, 5000, 10000];

export type MetricsRegistry = {
  observe(status: number, durationMs: number): void;
  incRateLimited(): void;
  renderPrometheus(): string;
};

export function createMetrics(): MetricsRegistry {
  const requestCounts = new Map<string, number>();
  const bucketCounts = new Map<string, number>();
  let rateLimited = 0;
  let totalCount = 0;
  let totalDuration = 0;

  function inc(map: Map<string, number>, key: string) {
    map.set(key, (map.get(key) ?? 0) + 1);
  }

  function observe(status: number, durationMs: number) {
    totalCount += 1;
    totalDuration += durationMs;
    inc(requestCounts, String(status));

    for (const bucket of latencyBuckets) {
      if (durationMs <= bucket) {
        inc(bucketCounts, String(bucket));
      }
    }
    inc(bucketCounts, "+Inf");
  }

  function incRateLimited() {
    rateLimited += 1;
  }

  function renderPrometheus(): string {
    const lines: string[] = [];

    lines.push("# HELP http_requests_total Total HTTP requests");
    lines.push("# TYPE http_requests_total counter");
    for (const [status, count] of requestCounts.entries()) {
      lines.push(`http_requests_total{status=\"${status}\"} ${count}`);
    }

    lines.push("# HELP http_request_duration_ms Request duration bucketed");
    lines.push("# TYPE http_request_duration_ms histogram");
    for (const bucket of latencyBuckets) {
      const count = bucketCounts.get(String(bucket)) ?? 0;
      lines.push(`http_request_duration_ms_bucket{le=\"${bucket}\"} ${count}`);
    }
    lines.push(`http_request_duration_ms_bucket{le=\"+Inf\"} ${bucketCounts.get("+Inf") ?? 0}`);
    lines.push(`http_request_duration_ms_count ${totalCount}`);
    lines.push(`http_request_duration_ms_sum ${totalDuration}`);

    lines.push("# HELP rate_limited_total Rate limited requests");
    lines.push("# TYPE rate_limited_total counter");
    lines.push(`rate_limited_total ${rateLimited}`);

    return `${lines.join("\n")}\n`;
  }

  return { observe, incRateLimited, renderPrometheus };
}

export function createMetricsPlugin(metrics: MetricsRegistry) {
  const seen = new WeakSet<Request>();

  function record(request: Request, status: number, durationMs: number) {
    if (seen.has(request)) return;
    seen.add(request);
    metrics.observe(status, durationMs);
  }

  return new Elysia({ name: "metrics" })
    .derive(() => ({ metricsStart: Date.now() }))
    .onAfterHandle(({ request, set, metricsStart }) => {
      const durationMs = Date.now() - (metricsStart ?? Date.now());
      const status = Number(set.status ?? 200);
      record(request, status, durationMs);
    })
    .onError(({ request, set, metricsStart }) => {
      const durationMs = Date.now() - (metricsStart ?? Date.now());
      const status = Number(set.status ?? 500);
      record(request, status, durationMs);
    })
    .as("global");
}
