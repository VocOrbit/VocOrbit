import { Elysia } from "elysia";
import { ok } from "../../../../packages/core/src/http/response";
import { withSpan } from "../../../../packages/core/src/observability/tracing";
import type { WordInsightPublicContract } from "../public-contract";
import {
  type WordInsightRouteOptions,
  resolveExplainBody,
  resolvePreferredTargetLanguage,
  resolveRequestId,
  resolveRequestUser,
  resolveRouteDetail,
  setAccepted,
} from "./route-shared";
import { createExplainWordBodySchema } from "./schemas";

export function createWordInsightExplainRoutes(
  wordInsight: WordInsightPublicContract,
  options: WordInsightRouteOptions = {},
) {
  const explainWordBodySchema = createExplainWordBodySchema({
    maxSentenceChars: options.maxSentenceChars,
    maxSelectedWordChars: options.maxSelectedWordChars,
  });

  return new Elysia({
    name: "word-insight-explain-routes",
    detail: resolveRouteDetail(options),
  })
    .post(
      "/word-insight/explain",
      async (context) => {
        return await withSpan(
          "word_insight.enqueue_explain_job",
          async (span) => {
            span.setAttribute("word_insight.route", "/v1/word-insight/explain");
            const user = resolveRequestUser(context, options.requiresAuth === true);
            const preferredTargetLang = resolvePreferredTargetLanguage(context);
            const body = resolveExplainBody(context);
            if (body.mode) {
              span.setAttribute("word_insight.mode", body.mode);
            }
            if (preferredTargetLang) {
              span.setAttribute("word_insight.preferred_target_lang", preferredTargetLang);
            }

            const job = await wordInsight.enqueueExplainJob(body, {
              user,
              requestId: resolveRequestId(context),
              preferredTargetLang,
            });
            if (options.onExplainJobQueued) {
              options.onExplainJobQueued(job.id);
            }
            setAccepted(context);

            span.setAttribute("word_insight.job_status", job.status);
            return ok({
              jobId: job.id,
              status: job.status,
            });
          }
        );
      },
      {
        body: explainWordBodySchema,
        detail: {
          summary: "Queue explain job for selected word in sentence context",
        },
      },
    )
    .post(
      "/word-insight/explain/direct",
      async (context) => {
        return await withSpan(
          "word_insight.explain_direct",
          async (span) => {
            span.setAttribute("word_insight.route", "/v1/word-insight/explain/direct");
            const user = resolveRequestUser(context, options.requiresAuth === true);
            const preferredTargetLang = resolvePreferredTargetLanguage(context);
            const body = resolveExplainBody(context);
            if (body.mode) {
              span.setAttribute("word_insight.mode", body.mode);
            }
            if (preferredTargetLang) {
              span.setAttribute("word_insight.preferred_target_lang", preferredTargetLang);
            }

            const result = await wordInsight.explainWord(body, {
              user,
              requestId: resolveRequestId(context),
              preferredTargetLang,
            });

            return ok({
              status: "completed" as const,
              result: {
                mode: result.mode,
                lookupId: result.lookupId,
                insight: result.insight,
              },
            });
          },
        );
      },
      {
        body: explainWordBodySchema,
        detail: {
          summary: "Run explain immediately without queue/polling",
        },
      },
    );
}
