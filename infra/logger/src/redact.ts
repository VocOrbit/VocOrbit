const SENSITIVE_KEYS = new Set(["authorization", "cookie", "set-cookie", "password", "token"]);

function shouldRedact(key: string): boolean {
  return SENSITIVE_KEYS.has(key.toLowerCase());
}

export function redact(value: unknown): unknown {
  if (Array.isArray(value)) {
    return value.map((item) => redact(item));
  }

  if (value && typeof value === "object") {
    const obj = value as Record<string, unknown>;
    const result: Record<string, unknown> = {};
    for (const [key, val] of Object.entries(obj)) {
      result[key] = shouldRedact(key) ? "[REDACTED]" : redact(val);
    }
    return result;
  }

  return value;
}
