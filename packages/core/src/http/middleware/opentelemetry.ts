import { opentelemetry } from "@elysiajs/opentelemetry";

function resolveServiceName(): string {
  const value = process.env.OTEL_SERVICE_NAME?.trim();
  return value && value.length > 0 ? value : "vocorbit-server-api";
}

export function createOpenTelemetryPlugin() {
  return opentelemetry({
    serviceName: resolveServiceName(),
  });
}
