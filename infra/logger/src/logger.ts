import type { LogLevel, Logger } from "../../../packages/core/src/logger";
import { redact } from "./redact";

const levelRank: Record<LogLevel, number> = {
  debug: 10,
  info: 20,
  warn: 30,
  error: 40,
};

function shouldLog(current: LogLevel, target: LogLevel): boolean {
  return levelRank[target] >= levelRank[current];
}

export function createLogger(level: LogLevel): Logger {
  const base = { level };

  function write(target: LogLevel, record: Record<string, unknown> & { msg: string }) {
    if (!shouldLog(level, target)) return;
    const payload = redact({
      ts: new Date().toISOString(),
      level: target,
      ...record,
    });

    console.log(JSON.stringify(payload));
  }

  return {
    ...base,
    debug: (record) => write("debug", record),
    info: (record) => write("info", record),
    warn: (record) => write("warn", record),
    error: (record) => write("error", record),
  };
}
