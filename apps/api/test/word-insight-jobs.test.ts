import { describe, expect, it } from "bun:test";
import { createInMemoryBus } from "../../../infra/events/src/bus";
import type { ExplainJobRecord } from "../../../modules/word-insight/src/ports/explain-job-repo";
import type { Logger } from "../../../packages/core/src/logger";
import {
  WORD_INSIGHT_JOB_STATUS_EVENT,
  createWordInsightJobHub,
  createWordInsightJobStatusPublisher,
  subscribeWordInsightJobStatusEvents,
} from "../src/word-insight-jobs";

function buildJob(status: ExplainJobRecord["status"]): ExplainJobRecord {
  const now = new Date().toISOString();
  return {
    id: "job-1",
    userId: "user-1",
    requestId: "req-1",
    status,
    input: {
      mode: "basic",
      sentence: "She likes cookies.",
      selectedWord: "cookies",
      sourceLang: "en",
      targetLang: "tr",
    },
    context: {
      requestId: "req-1",
      user: {
        id: "user-1",
        name: "u",
        email: "u@example.com",
        role: "user",
      },
    },
    attempt: 1,
    createdAt: now,
    updatedAt: now,
  };
}

describe("word insight job hub", () => {
  it("closes socket automatically on terminal state when no subscriptions left", () => {
    const sent: string[] = [];
    const closed: Array<{ code?: number; reason?: string }> = [];
    const socket = {
      send(data: string) {
        sent.push(data);
      },
      close(code?: number, reason?: string) {
        closed.push({ code, reason });
      },
    };

    const logger: Logger = {
      level: "error",
      debug() {},
      info() {},
      warn() {},
      error() {},
    };
    const hub = createWordInsightJobHub(logger);

    hub.subscribe({
      socketKey: "socket-1",
      socket,
      userId: "user-1",
      jobId: "job-1",
    });

    hub.publish(buildJob("processing"));
    expect(sent.length).toBe(1);
    expect(closed.length).toBe(0);

    hub.publish(buildJob("completed"));
    expect(sent.length).toBe(2);
    expect(closed.length).toBe(1);
    expect(closed[0]?.code).toBe(1000);
    expect(closed[0]?.reason).toBe("job_terminal");
  });

  it("does not close socket if there are other active subscriptions", () => {
    const closed: Array<{ code?: number; reason?: string }> = [];
    const socket = {
      send() {},
      close(code?: number, reason?: string) {
        closed.push({ code, reason });
      },
    };

    const logger: Logger = {
      level: "error",
      debug() {},
      info() {},
      warn() {},
      error() {},
    };
    const hub = createWordInsightJobHub(logger);

    hub.subscribe({
      socketKey: "socket-1",
      socket,
      userId: "user-1",
      jobId: "job-1",
    });
    hub.subscribe({
      socketKey: "socket-1",
      socket,
      userId: "user-1",
      jobId: "job-2",
    });

    const completedJob1 = buildJob("completed");
    completedJob1.id = "job-1";
    hub.publish(completedJob1);
    expect(closed.length).toBe(0);

    const completedJob2 = buildJob("completed");
    completedJob2.id = "job-2";
    hub.publish(completedJob2);
    expect(closed.length).toBe(1);
  });

  it("re-publishes worker status events to local websocket hub across processes", async () => {
    const sent: string[] = [];
    const socket = {
      send(data: string) {
        sent.push(data);
      },
      close() {},
    };

    const logger: Logger = {
      level: "error",
      debug() {},
      info() {},
      warn() {},
      error() {},
    };

    const hub = createWordInsightJobHub(logger);
    hub.subscribe({
      socketKey: "socket-1",
      socket,
      userId: "user-1",
      jobId: "job-1",
    });

    const eventBus = createInMemoryBus();
    const stopSubscribe = await subscribeWordInsightJobStatusEvents({
      eventBus,
      hub,
      logger,
      nodeId: "api-node-1",
    });
    const workerPublisher = createWordInsightJobStatusPublisher({
      eventBus,
      logger,
      sourceNodeId: "worker-node-1",
    });

    await workerPublisher(buildJob("processing"));
    expect(sent.length).toBe(1);
    const firstPayload = JSON.parse(sent[0] ?? "{}") as {
      type?: string;
      data?: { status?: string };
    };
    expect(firstPayload.type).toBe("word_insight_job");
    expect(firstPayload.data?.status).toBe("processing");

    const sameNodePublisher = createWordInsightJobStatusPublisher({
      eventBus,
      logger,
      sourceNodeId: "api-node-1",
    });
    await sameNodePublisher(buildJob("processing"));
    expect(sent.length).toBe(1);

    await eventBus.emit(WORD_INSIGHT_JOB_STATUS_EVENT, { invalid: true });
    expect(sent.length).toBe(1);

    await stopSubscribe();
  });
});
