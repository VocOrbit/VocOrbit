import type { EventBus, Unsubscribe } from "../../../infra/events/src/bus";
import type { ExplainJobRecord } from "../../../modules/word-insight/src/ports/explain-job-repo";
import type { WordInsightPublicContract } from "../../../modules/word-insight/src/public-contract";
import type { Logger } from "../../../packages/core/src/logger";

type JobSocket = {
  send(data: string): unknown;
  close(code?: number, reason?: string): unknown;
};

type WordInsightJobStatusEvent = {
  sourceNodeId: string;
  publishedAt: string;
  job: ExplainJobRecord;
};

type WordInsightJobStatusPublisherDeps = {
  eventBus: EventBus;
  logger: Logger;
  sourceNodeId: string;
};

type WordInsightJobStatusSubscriberDeps = {
  eventBus: EventBus;
  hub: ReturnType<typeof createWordInsightJobHub>;
  logger: Logger;
  nodeId: string;
};

export const WORD_INSIGHT_JOB_STATUS_EVENT = "word_insight.job.status";

function isTerminalStatus(status: ExplainJobRecord["status"]): boolean {
  return status === "completed" || status === "failed";
}

function isObject(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function isExplainJobStatus(value: unknown): value is ExplainJobRecord["status"] {
  return (
    value === "queued" || value === "processing" || value === "completed" || value === "failed"
  );
}

function isWordInsightJobStatusEvent(value: unknown): value is WordInsightJobStatusEvent {
  if (!isObject(value)) return false;

  const sourceNodeId = value.sourceNodeId;
  const publishedAt = value.publishedAt;
  const job = value.job;
  if (typeof sourceNodeId !== "string" || sourceNodeId.trim().length === 0) return false;
  if (typeof publishedAt !== "string" || publishedAt.trim().length === 0) return false;
  if (!isObject(job)) return false;

  return (
    typeof job.id === "string" &&
    job.id.trim().length > 0 &&
    typeof job.userId === "string" &&
    job.userId.trim().length > 0 &&
    isExplainJobStatus(job.status)
  );
}

function formatError(error: unknown): string {
  return error instanceof Error ? error.message : String(error);
}

export function createWordInsightJobStatusPublisher(deps: WordInsightJobStatusPublisherDeps) {
  const sourceNodeId = deps.sourceNodeId.trim();

  return async (job: ExplainJobRecord) => {
    try {
      await deps.eventBus.emit<WordInsightJobStatusEvent>(WORD_INSIGHT_JOB_STATUS_EVENT, {
        sourceNodeId,
        publishedAt: new Date().toISOString(),
        job,
      });
    } catch (error) {
      deps.logger.warn({
        msg: "word_insight_job_status_event_emit_failed",
        sourceNodeId,
        jobId: job.id,
        userId: job.userId,
        error: formatError(error),
      });
    }
  };
}

export async function subscribeWordInsightJobStatusEvents(
  deps: WordInsightJobStatusSubscriberDeps,
): Promise<Unsubscribe> {
  const nodeId = deps.nodeId.trim();

  return await deps.eventBus.on<unknown>(WORD_INSIGHT_JOB_STATUS_EVENT, async (payload) => {
    if (!isWordInsightJobStatusEvent(payload)) {
      deps.logger.warn({
        msg: "word_insight_job_status_event_invalid_payload",
      });
      return;
    }

    if (payload.sourceNodeId === nodeId) {
      return;
    }

    deps.hub.publish(payload.job);
  });
}

export function createWordInsightJobHub(
  logger: Logger,
  options: {
    autoCloseOnTerminal?: boolean;
  } = {},
) {
  const autoCloseOnTerminal = options.autoCloseOnTerminal ?? true;
  const subscribersByJob = new Map<string, Map<string, { socket: JobSocket; userId: string }>>();
  const jobIdsBySocket = new Map<string, Set<string>>();

  function removeSubscription(jobId: string, socketKey: string) {
    const perJob = subscribersByJob.get(jobId);
    if (!perJob) return;
    perJob.delete(socketKey);
    if (perJob.size === 0) {
      subscribersByJob.delete(jobId);
    }
  }

  return {
    subscribe(input: { socketKey: string; socket: JobSocket; userId: string; jobId: string }) {
      const perJob = subscribersByJob.get(input.jobId) ?? new Map();
      perJob.set(input.socketKey, {
        socket: input.socket,
        userId: input.userId,
      });
      subscribersByJob.set(input.jobId, perJob);

      const socketJobs = jobIdsBySocket.get(input.socketKey) ?? new Set<string>();
      socketJobs.add(input.jobId);
      jobIdsBySocket.set(input.socketKey, socketJobs);
    },

    unsubscribe(input: { socketKey: string; jobId: string }) {
      removeSubscription(input.jobId, input.socketKey);

      const socketJobs = jobIdsBySocket.get(input.socketKey);
      if (!socketJobs) return;
      socketJobs.delete(input.jobId);
      if (socketJobs.size === 0) {
        jobIdsBySocket.delete(input.socketKey);
      }
    },

    removeSocket(socketKey: string) {
      const socketJobs = jobIdsBySocket.get(socketKey);
      if (!socketJobs) return;
      for (const jobId of socketJobs) {
        removeSubscription(jobId, socketKey);
      }
      jobIdsBySocket.delete(socketKey);
    },

    publish(job: ExplainJobRecord) {
      const perJob = subscribersByJob.get(job.id);
      if (!perJob || perJob.size === 0) return;

      const payload = JSON.stringify({
        type: "word_insight_job",
        data: job,
      });
      const isTerminal = isTerminalStatus(job.status);

      for (const [socketKey, subscriber] of perJob) {
        if (subscriber.userId !== job.userId) continue;
        try {
          subscriber.socket.send(payload);
        } catch (error) {
          logger.warn({
            msg: "word_insight_ws_send_failed",
            jobId: job.id,
            userId: job.userId,
            error: error instanceof Error ? error.message : String(error),
          });
          this.removeSocket(socketKey);
          continue;
        }

        if (!isTerminal) {
          continue;
        }

        removeSubscription(job.id, socketKey);

        const socketJobs = jobIdsBySocket.get(socketKey);
        if (!socketJobs) continue;
        socketJobs.delete(job.id);

        if (socketJobs.size === 0) {
          jobIdsBySocket.delete(socketKey);
          if (autoCloseOnTerminal) {
            try {
              subscriber.socket.close(1000, "job_terminal");
            } catch {
              // no-op
            }
          }
        }
      }
    },
  };
}

type WordInsightJobRunnerDeps = {
  wordInsight: Pick<WordInsightPublicContract, "processNextExplainJob">;
  logger: Logger;
  hub: ReturnType<typeof createWordInsightJobHub>;
  publishStatusEvent?: (job: ExplainJobRecord) => Promise<void> | void;
};

type WordInsightJobRunnerOptions = {
  concurrency?: number;
  tickMs?: number;
  homeRegion?: string;
  workerId?: string;
};

export function createWordInsightJobRunner(
  deps: WordInsightJobRunnerDeps,
  options: WordInsightJobRunnerOptions = {},
) {
  const concurrency = Math.max(1, Math.floor(options.concurrency ?? 4));
  const tickMs = Math.max(100, Math.floor(options.tickMs ?? 500));
  const homeRegion = options.homeRegion?.trim().toLowerCase();
  const workerId = options.workerId?.trim();

  let stopped = false;
  let timer: ReturnType<typeof setInterval> | undefined;
  let activeWorkers = 0;
  const workerPromises = new Set<Promise<void>>();

  const spawnWorker = () => {
    activeWorkers += 1;
    const worker = (async () => {
      try {
        while (!stopped) {
          const processed = await deps.wordInsight.processNextExplainJob({
            onStatus: async (job) => {
              deps.hub.publish(job);
              if (deps.publishStatusEvent) {
                try {
                  await deps.publishStatusEvent(job);
                } catch (error) {
                  deps.logger.warn({
                    msg: "word_insight_job_status_publish_failed",
                    jobId: job.id,
                    userId: job.userId,
                    error: formatError(error),
                  });
                }
              }
              if (job.status === "failed") {
                deps.logger.error({
                  msg: "word_insight_job_failed",
                  jobId: job.id,
                  requestId: job.requestId,
                  userId: job.userId,
                  mode: job.input.mode,
                  errorCode: job.errorCode,
                  errorMessage: job.errorMessage,
                  attempt: job.attempt,
                  homeRegion: job.homeRegion,
                  shardId: job.shardId,
                  claimedByRegion: job.claimedByRegion,
                  claimedByWorker: job.claimedByWorker,
                });
              }
            },
            claimFilter: {
              homeRegion,
              claimedByRegion: homeRegion,
              claimedByWorker: workerId,
            },
          });
          if (!processed) break;
        }
      } catch (error) {
        deps.logger.error({
          msg: "word_insight_job_runner_worker_failed",
          error: error instanceof Error ? error.message : String(error),
        });
      } finally {
        activeWorkers = Math.max(0, activeWorkers - 1);
      }
    })();

    workerPromises.add(worker);
    void worker.finally(() => {
      workerPromises.delete(worker);
    });
  };

  const kick = () => {
    if (stopped) return;
    while (activeWorkers < concurrency) {
      spawnWorker();
    }
  };

  return {
    start() {
      if (timer) return;
      stopped = false;
      kick();
      timer = setInterval(() => {
        kick();
      }, tickMs);
      deps.logger.info({
        msg: "word_insight_job_runner_started",
        concurrency,
        tickMs,
        homeRegion,
        workerId,
      });
    },

    async stop() {
      if (stopped) return;
      stopped = true;
      if (timer) clearInterval(timer);
      timer = undefined;
      await Promise.all(Array.from(workerPromises));
      deps.logger.info({
        msg: "word_insight_job_runner_stopped",
      });
    },

    kick,
  };
}
