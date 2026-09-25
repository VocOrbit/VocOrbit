import { Elysia } from "elysia";
import { ok } from "../../../../packages/core/src/http/response";
import type { WordInsightPublicContract } from "../public-contract";
import type { ExplainJobRecord } from "../ports/explain-job-repo";
import {
  type WordInsightRouteOptions,
  resolveIncludeInsight,
  resolveJobId,
  resolveRequestUser,
  resolveRouteDetail,
} from "./route-shared";
import { wordInsightJobParamsSchema, wordInsightJobQuerySchema } from "./schemas";

function mapJobForResponse(job: ExplainJobRecord, includeInsight: boolean) {
  const result = job.result
    ? {
        mode: job.result.mode,
        lookupId: job.result.lookupId,
        ...(includeInsight ? { insight: job.result.insight } : {}),
      }
    : undefined;

  return {
    id: job.id,
    status: job.status,
    input: job.input,
    result,
    errorCode: job.errorCode,
    errorMessage: job.errorMessage,
  };
}

export function createWordInsightJobRoutes(
  wordInsight: WordInsightPublicContract,
  options: WordInsightRouteOptions = {},
) {
  return new Elysia({
    name: "word-insight-job-routes",
    detail: resolveRouteDetail(options),
  }).get(
    "/word-insight/jobs/:id",
    async (context) => {
      const user = resolveRequestUser(context, options.requiresAuth === true);
      const job = await wordInsight.getExplainJob({
        userId: user.id,
        jobId: resolveJobId(context),
      });
      return ok(mapJobForResponse(job, resolveIncludeInsight(context)));
    },
    {
      params: wordInsightJobParamsSchema,
      query: wordInsightJobQuerySchema,
      detail: {
        summary: "Get explain job status/result",
      },
    },
  );
}
