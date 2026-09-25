import type { WordInsightProvider } from "../../../../modules/word-insight/src/ports/word-insight-provider";
import { withSpan } from "../../../../packages/core/src/observability/tracing";
import { toInsight } from "./insight-mapper";
import { buildOpenAiMessages, buildOpenAiResponseFormat } from "./openai-prompt";
import { parseModelOutput } from "./output-parser";
import { resolveWordInsightOutputTokenBudget } from "./token-budget";
import type { DeepSeekWordInsightProviderConfig } from "./types";

const JSON_RETRY_INSTRUCTION =
  "Previous output was invalid. Return only one valid JSON object matching the requested schema. Ensure definitionL2 is present and contextual. For advanced mode include non-empty exampleSentence, translatedExample, synonyms, antonyms, collocations and alternativeMeanings. Include usageNotes when useful. definitionL2/sourceMeaning/exampleSentence/synonyms/alternativeMeanings/antonyms/collocations must be in sourceLang with [[SL]] prefix. translationL1/meaning/whyThisSense/shortExplanation/translatedExample/usageNotes must be in targetLang with [[TL]] prefix. For arrays, every item must include the right prefix. No markdown, no comments, no extra text.";

function shouldRetryModelOutputError(error: unknown): boolean {
  if (!(error instanceof Error)) return false;
  return (
    error.message === "invalid_model_json_output" ||
    error.message === "empty_model_output" ||
    error.message === "model_output_schema_violation" ||
    error.message === "model_output_language_marker_violation" ||
    error.message === "model_output_language_violation"
  );
}

export function createDeepSeekWordInsightProvider(
  config: DeepSeekWordInsightProviderConfig,
): WordInsightProvider {
  const baseUrl = (config.baseUrl ?? "https://api.deepseek.com/v1").replace(/\/+$/, "");
  const timeoutMs = config.timeoutMs ?? 15_000;
  const basicTimeoutMs = Math.min(timeoutMs, 8_000);

  return {
    async explainWord(input) {
      const baseMessages = buildOpenAiMessages(input);
      const tokenBudget = resolveWordInsightOutputTokenBudget(input.mode);
      const attempts: Array<{
        maxTokens: number;
        timeoutMs: number;
        messages: Array<{ role: "system" | "user"; content: string }>;
      }> =
        input.mode === "advanced"
          ? [
              { maxTokens: tokenBudget.initial, timeoutMs, messages: baseMessages },
              {
                maxTokens: tokenBudget.retry,
                timeoutMs,
                messages: [
                  ...baseMessages,
                  {
                    role: "user" as const,
                    content: JSON_RETRY_INSTRUCTION,
                  },
                ],
              },
            ]
          : [
              { maxTokens: tokenBudget.initial, timeoutMs: basicTimeoutMs, messages: baseMessages },
              {
                maxTokens: tokenBudget.retry,
                timeoutMs: Math.min(timeoutMs, 5_000),
                messages: [
                  ...baseMessages,
                  {
                    role: "user" as const,
                    content: JSON_RETRY_INSTRUCTION,
                  },
                ],
              },
            ];

      for (let attemptIndex = 0; attemptIndex < attempts.length; attemptIndex += 1) {
        const attempt = attempts[attemptIndex];
        if (!attempt) continue;
        const responseFormats =
          input.mode === "advanced"
            ? ([
                buildOpenAiResponseFormat(input.mode),
                { type: "json_object" as const },
                undefined,
              ] as const)
            : ([{ type: "json_object" as const }, undefined] as const);

        for (let formatIndex = 0; formatIndex < responseFormats.length; formatIndex += 1) {
          const responseFormat = responseFormats[formatIndex];
          const controller = new AbortController();
          const timeout = setTimeout(() => controller.abort(), attempt.timeoutMs);

          try {
            const response = await withSpan(
              "ai.deepseek.chat_completions",
              async (span) => {
                const response = await fetch(`${baseUrl}/chat/completions`, {
                  method: "POST",
                  headers: {
                    "content-type": "application/json",
                    authorization: `Bearer ${config.apiKey}`,
                  },
                  signal: controller.signal,
                  body: JSON.stringify({
                    model: config.model,
                    temperature: 0,
                    max_tokens: attempt.maxTokens,
                    ...(responseFormat ? { response_format: responseFormat } : {}),
                    messages: attempt.messages,
                  }),
                });
                span.setAttribute("http.status_code", response.status);
                return response;
              },
              {
                attributes: {
                  "ai.provider": "deepseek",
                  "ai.model": config.model,
                  "word_insight.mode": input.mode,
                  "word_insight.retry_attempt": attemptIndex + 1,
                  "word_insight.response_format": responseFormat?.type ?? "none",
                },
              },
            );

            if (!response.ok) {
              const text = await response.text();
              const shouldFallbackResponseFormat =
                response.status === 400 && formatIndex < responseFormats.length - 1;

              if (shouldFallbackResponseFormat) {
                const nextResponseFormat = responseFormats[formatIndex + 1];
                config.logger?.warn({
                  msg: "word_insight_deepseek_response_format_fallback",
                  status: response.status,
                  errorLength: text.length,
                  attempt: attemptIndex + 1,
                  from: responseFormat?.type ?? "none",
                  to: nextResponseFormat?.type ?? "none",
                });
                continue;
              }

              config.logger?.error({
                msg: "word_insight_deepseek_http_error",
                status: response.status,
                errorLength: text.length,
              });
              throw new Error(`word_insight_deepseek_http_${response.status}`);
            }

            const payload = (await response.json()) as {
              choices?: Array<{
                message?: { content?: string | null };
                finish_reason?: string | null;
              }>;
            };
            const choice = payload.choices?.[0];
            const content = choice?.message?.content;
            if (typeof content !== "string" || content.trim().length === 0) {
              if (attemptIndex < attempts.length - 1) {
                config.logger?.warn({
                  msg: "word_insight_deepseek_parse_retry",
                  attempt: attemptIndex + 1,
                  reason: "empty_content",
                  finishReason: choice?.finish_reason ?? undefined,
                });
                break;
              }
              throw new Error("word_insight_deepseek_empty_message");
            }

            try {
              const parsed = parseModelOutput(content, {
                mode: input.mode,
                sourceLang: input.sourceLang,
                targetLang: input.targetLang,
              });
              return toInsight(input, parsed, "deepseek", config.model);
            } catch (error) {
              if (attemptIndex < attempts.length - 1 && shouldRetryModelOutputError(error)) {
                config.logger?.warn({
                  msg: "word_insight_deepseek_parse_retry",
                  attempt: attemptIndex + 1,
                  reason: error instanceof Error ? error.message : "parse_error",
                  finishReason: choice?.finish_reason ?? undefined,
                });
                break;
              }
              throw error;
            }
          } catch (error) {
            if (error instanceof Error && error.name === "AbortError") {
              throw new Error("word_insight_deepseek_timeout");
            }
            throw error;
          } finally {
            clearTimeout(timeout);
          }
        }
      }

      throw new Error("word_insight_deepseek_empty_message");
    },
  };
}
