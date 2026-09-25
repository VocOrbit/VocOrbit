import {
  DiscardPolicy,
  JSONCodec,
  type JetStreamManager,
  type JetStreamSubscription,
  RetentionPolicy,
  StorageType,
  connect,
  consumerOpts,
  createInbox,
} from "nats";

export type EventHandler<T> = (payload: T) => void | Promise<void>;
export type Unsubscribe = () => Promise<void>;

export interface EventBus {
  on<T>(event: string, handler: EventHandler<T>): Promise<Unsubscribe>;
  emit<T>(event: string, payload: T): Promise<void>;
  close(): Promise<void>;
}

export function createInMemoryBus(): EventBus {
  const handlers = new Map<string, EventHandler<unknown>[]>();

  return {
    async on<T>(event: string, handler: EventHandler<T>) {
      const list = handlers.get(event) ?? [];
      list.push(handler as EventHandler<unknown>);
      handlers.set(event, list);
      return async () => {
        const current = handlers.get(event) ?? [];
        const next = current.filter((item) => item !== (handler as EventHandler<unknown>));
        if (next.length === 0) {
          handlers.delete(event);
          return;
        }
        handlers.set(event, next);
      };
    },
    async emit<T>(event: string, payload: T) {
      const list = handlers.get(event) ?? [];
      for (const handler of list) {
        await handler(payload);
      }
    },
    async close() {
      handlers.clear();
    },
  };
}

type NatsBusErrorPhase = "publish" | "subscribe" | "decode" | "handler";

export type NatsJetStreamBusOptions = {
  streamName?: string;
  streamSubjects?: string[];
  subjectPrefix?: string;
  queueGroup?: string;
  durableNamePrefix?: string;
  onError?: (
    error: unknown,
    context: {
      event: string;
      phase: NatsBusErrorPhase;
    },
  ) => void;
};

const codec = JSONCodec<unknown>();

type ParsedServerOptions = {
  servers: string | string[];
  user?: string;
  pass?: string;
};

function splitServerInputs(input: string | string[]): string[] {
  const values = Array.isArray(input) ? input : [input];
  return values
    .flatMap((value) => value.split(","))
    .map((value) => value.trim())
    .filter((value) => value.length > 0);
}

function parseServerOptions(input: string | string[]): ParsedServerOptions {
  const entries = splitServerInputs(input);
  if (entries.length === 0) {
    throw new Error("NATS servers list is empty");
  }

  const normalizedServers: string[] = [];
  let resolvedUser: string | undefined;
  let resolvedPass: string | undefined;

  for (const entry of entries) {
    try {
      const parsed = new URL(entry);
      const protocol = parsed.protocol.toLowerCase();
      const supportsUserInfo =
        protocol === "nats:" || protocol === "tls:" || protocol === "ws:" || protocol === "wss:";

      if (!supportsUserInfo) {
        normalizedServers.push(entry);
        continue;
      }

      const hasUserInfo = parsed.username.length > 0 || parsed.password.length > 0;
      if (!hasUserInfo) {
        normalizedServers.push(entry);
        continue;
      }

      const user = parsed.username ? decodeURIComponent(parsed.username) : "";
      const pass = decodeURIComponent(parsed.password);

      if (resolvedUser === undefined) {
        resolvedUser = user;
      } else if (resolvedUser !== user) {
        throw new Error("NATS server URLs contain different usernames");
      }

      if (resolvedPass === undefined) {
        resolvedPass = pass;
      } else if (resolvedPass !== pass) {
        throw new Error("NATS server URLs contain different passwords");
      }

      parsed.username = "";
      parsed.password = "";
      normalizedServers.push(`${parsed.protocol}//${parsed.host}`);
    } catch {
      normalizedServers.push(entry);
    }
  }

  const servers = normalizedServers.length === 1 ? normalizedServers[0] : normalizedServers;
  return {
    servers,
    user: resolvedUser,
    pass: resolvedPass,
  };
}

function normalizeSubjectPrefix(prefix: string | undefined): string {
  return (prefix ?? "events").trim().replace(/\.+$/u, "");
}

function toSubject(event: string, subjectPrefix: string): string {
  const normalizedEvent = event.trim();
  if (!normalizedEvent) {
    throw new Error("Event name cannot be empty");
  }
  return subjectPrefix ? `${subjectPrefix}.${normalizedEvent}` : normalizedEvent;
}

function defaultSubjects(subjectPrefix: string): string[] {
  return subjectPrefix ? [`${subjectPrefix}.>`] : [">"];
}

function uniqueSubjects(subjects: string[]): string[] {
  return [
    ...new Set(subjects.map((subject) => subject.trim()).filter((subject) => subject.length > 0)),
  ];
}

function isStreamNotFoundError(error: unknown): boolean {
  if (!error || typeof error !== "object") {
    return false;
  }
  const maybeCode = "code" in error ? String(error.code) : "";
  if (maybeCode === "404") {
    return true;
  }
  const maybeMessage = "message" in error ? String(error.message).toLowerCase() : "";
  return maybeMessage.includes("stream not found");
}

function buildDurableName(prefix: string, event: string, index: number): string {
  const normalized = `${prefix}-${event}-${index}`
    .toLowerCase()
    .replace(/[^a-z0-9_-]+/gu, "-")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "");
  return normalized.slice(0, 128) || `handler-${index}`;
}

async function ensureStream(
  jsm: JetStreamManager,
  streamName: string,
  subjects: string[],
): Promise<void> {
  try {
    const info = await jsm.streams.info(streamName);
    const existing = new Set(info.config.subjects ?? []);
    const missing = subjects.filter((subject) => !existing.has(subject));
    if (missing.length > 0) {
      await jsm.streams.update(streamName, { subjects: [...existing, ...missing] });
    }
  } catch (error) {
    if (!isStreamNotFoundError(error)) {
      throw error;
    }
    await jsm.streams.add({
      name: streamName,
      subjects,
      storage: StorageType.File,
      retention: RetentionPolicy.Limits,
      discard: DiscardPolicy.Old,
    });
  }
}

export async function createNatsJetStreamBus(
  servers: string | string[],
  options: NatsJetStreamBusOptions = {},
): Promise<EventBus> {
  const streamName = options.streamName?.trim() || "APP_EVENTS";
  const subjectPrefix = normalizeSubjectPrefix(options.subjectPrefix);
  const streamSubjects = uniqueSubjects(options.streamSubjects ?? defaultSubjects(subjectPrefix));

  if (streamSubjects.length === 0) {
    throw new Error("At least one stream subject is required");
  }

  const parsedServers = parseServerOptions(servers);
  const nc = await connect({
    servers: parsedServers.servers,
    ...(parsedServers.user !== undefined ? { user: parsedServers.user } : {}),
    ...(parsedServers.pass !== undefined ? { pass: parsedServers.pass } : {}),
  });
  const jsm = await nc.jetstreamManager();
  await ensureStream(jsm, streamName, streamSubjects);
  const js = nc.jetstream();

  const subscriptions = new Set<JetStreamSubscription>();
  let durableCounter = 0;

  return {
    async on<T>(event: string, handler: EventHandler<T>) {
      const subject = toSubject(event, subjectPrefix);
      const opts = consumerOpts();
      opts.deliverTo(createInbox());

      opts.deliverNew();
      opts.ackExplicit();
      opts.manualAck();

      if (options.queueGroup) {
        opts.queue(options.queueGroup);
      }

      if (options.durableNamePrefix) {
        durableCounter += 1;
        opts.durable(buildDurableName(options.durableNamePrefix, event, durableCounter));
      }

      opts.callback((error, message) => {
        if (error) {
          options.onError?.(error, { event, phase: "subscribe" });
          return;
        }
        if (!message) {
          return;
        }

        let payload: T;
        try {
          payload = codec.decode(message.data) as T;
        } catch (decodeError) {
          options.onError?.(decodeError, { event, phase: "decode" });
          message.term("invalid_json_payload");
          return;
        }

        void (async () => {
          try {
            await handler(payload);
            message.ack();
          } catch (handlerError) {
            options.onError?.(handlerError, { event, phase: "handler" });
            message.nak();
          }
        })();
      });

      const sub = await js.subscribe(subject, opts);
      subscriptions.add(sub);
      sub.closed
        .finally(() => {
          subscriptions.delete(sub);
        })
        .catch(() => undefined);

      return async () => {
        sub.unsubscribe();
        await sub.closed.catch(() => undefined);
      };
    },

    async emit<T>(event: string, payload: T) {
      const subject = toSubject(event, subjectPrefix);
      try {
        await js.publish(subject, codec.encode(payload));
      } catch (error) {
        options.onError?.(error, { event, phase: "publish" });
        throw error;
      }
    },

    async close() {
      for (const sub of subscriptions) {
        sub.unsubscribe();
      }
      subscriptions.clear();
      await nc.drain();
      await nc.closed();
    },
  };
}
