export type LogLevel = "debug" | "info" | "warn" | "error";

export type LogRecord = Record<string, unknown> & { msg: string };

export interface Logger {
  level: LogLevel;
  debug(record: LogRecord): void;
  info(record: LogRecord): void;
  warn(record: LogRecord): void;
  error(record: LogRecord): void;
}
