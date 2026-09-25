import { AppError } from "../../../../packages/core/src/errors";
import type {
  ExplainJobClaimFilter,
  ExplainJobRecord,
  WordInsightExplainJobRepo,
} from "../ports/explain-job-repo";
import type { ExplainWordDeps } from "./explain-word";
import { explainWord } from "./explain-word";
import { withSpan } from "../../../../packages/core/src/observability/tracing";

type ProcessNextExplainJobDeps = ExplainWordDeps & {
  jobs: WordInsightExplainJobRepo;
};

type ProcessNextExplainJobOptions = {
  onStatus?: (job: ExplainJobRecord) => Promise<void> | void;
  claimFilter?: ExplainJobClaimFilter;
};

function toJobError(error: unknown): { code: string; message: string } {
  if (error instanceof AppError) {
    return {
      code: error.code,
      message: error.message,
    };
  }

  if (error instanceof Error) {
    return {
      code: "INTERNAL_ERROR",
      message: error.message,
    };
  }

  return {
    code: "INTERNAL_ERROR",
    message: String(error),
  };
}

function withFallbackFailedJob(
  job: ExplainJobRecord,
  failure: { code: string; message: string },
): ExplainJobRecord {
  const now = new Date().toISOString();
  return {
    ...job,
    status: "failed",
    errorCode: failure.code,
    errorMessage: failure.message,
    finishedAt: now,
    updatedAt: now,
  };
}

export async function processNextExplainJob(
  deps: ProcessNextExplainJobDeps,
  options: ProcessNextExplainJobOptions = {},
): Promise<ExplainJobRecord | null> {
  const claimed = await deps.jobs.claimNextQueued(options.claimFilter);
  if (!claimed) return null;

  return await withSpan("word_insight.process_next_explain_job", async (span) => {
    span.setAttribute("word_insight.job_claimed", true);
    span.setAttribute("word_insight.job_mode", claimed.input.mode);

    if (options.onStatus) {
      await options.onStatus(claimed);
    }

    try {
      const result = await withSpan(
        "word_insight.job_explain",
        () =>
          explainWord(deps, claimed.input, {
            user: claimed.context.user,
            requestId: claimed.requestId,
            preferredTargetLang: claimed.context.preferredTargetLang,
          }),
        {
          attributes: {
            "word_insight.job_mode": claimed.input.mode,
          },
        },
      );

      const completed = await withSpan(
        "word_insight.job_mark_completed",
        () =>
          deps.jobs.markCompleted({
            jobId: claimed.id,
            result,
          }),
      );
      const completedJob: ExplainJobRecord =
        completed ??
        ({
          ...claimed,
          status: "completed",
          result,
        } as ExplainJobRecord);

      if (options.onStatus) {
        await options.onStatus(completedJob);
      }
      span.setAttribute("word_insight.job_status", "completed");
      return completedJob;
    } catch (error) {
      const failure = toJobError(error);
      const failed =
        (await withSpan(
          "word_insight.job_mark_failed",
          () =>
            deps.jobs.markFailed({
              jobId: claimed.id,
              errorCode: failure.code,
              errorMessage: failure.message,
            }),
        )) ?? withFallbackFailedJob(claimed, failure);

      if (options.onStatus) {
        await options.onStatus(failed);
      }
      span.setAttribute("word_insight.job_status", "failed");
      span.setAttribute("word_insight.error_code", failure.code);
      return failed;
    }
  });
}
