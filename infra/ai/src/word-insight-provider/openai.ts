import type { WordInsightProvider } from "../../../../modules/word-insight/src/ports/word-insight-provider";
import { withSpan } from "../../../../packages/core/src/observability/tracing";
import { toInsight } from "./insight-mapper";
import { buildOpenAiMessages, buildOpenAiResponseFormat } from "./openai-prompt";
import { parseModelOutput } from "./output-parser";
import { resolveWordInsightOutputTokenBudget } from "./token-budget";
import type { OpenAiWordInsightProviderConfig, ParsedModelOutput } from "./types";

const JSON_RETRY_INSTRUCTION =
  "Previous output was invalid. Return only one valid JSON object matching the requested schema. Do not swap sourceLang and targetLang. Ensure definitionL2 is present and contextual. For advanced mode include non-empty exampleSentence, translatedExample, synonyms, antonyms, collocations and alternativeMeanings. Include usageNotes when useful. definitionL2/sourceMeaning/exampleSentence/synonyms/alternativeMeanings/antonyms/collocations must be in sourceLang with [[SL]] prefix. translationL1/meaning/whyThisSense/shortExplanation/translatedExample/usageNotes must be in targetLang with [[TL]] prefix. For arrays, every item must include the right prefix. No markdown, no comments, no extra text.";

type ResponseFormatPreference = "json_schema" | "json_object" | "none";

function normalizeLenientJsonContent(content: string): string {
  const trimmed = content.trim();
  if (!trimmed.startsWith("```")) return trimmed;

  const lines = trimmed.split(/\r?\n/);
  if (lines.length < 2) return trimmed;
  const first = lines[0]?.trim() ?? "";
  const last = lines[lines.length - 1]?.trim() ?? "";
  if (!first.startsWith("```")) return trimmed;
  if (last !== "```") return trimmed;

  return lines.slice(1, -1).join("\n").trim();
}

function clampFallbackText(value: string, maxChars: number): string {
  const normalized = value.replace(/\s+/g, " ").trim();
  if (!normalized) return "";
  if (normalized.length <= maxChars) return normalized;
  const sliced = normalized.slice(0, maxChars).trim();
  return sliced.replace(/[,\s;:.-]+$/g, "").trim();
}

function shouldUseBasicHardFallback(error: unknown): boolean {
  if (!(error instanceof Error)) return false;
  if (shouldRetryModelOutputError(error)) return true;
  if (error.message === "word_insight_openai_timeout") return true;

  const httpMatch = /^word_insight_openai_http_(\d{3})$/.exec(error.message);
  if (!httpMatch) return false;
  const status = Number(httpMatch[1]);
  if (!Number.isFinite(status)) return false;
  return status >= 500 || status === 429;
}

function buildBasicHardFallbackOutput(input: {
  selectedWord: string;
  sentence: string;
}): ParsedModelOutput {
  const selectedWord = clampFallbackText(input.selectedWord, 80) || "word";
  const definition = clampFallbackText(input.sentence, 320) || selectedWord;

  return {
    surface: selectedWord,
    lemma: selectedWord.toLocaleLowerCase("en-US"),
    partOfSpeech: "unknown",
    definitionL2: definition,
    sourceMeaning: definition,
    translationL1: selectedWord,
    meaning: selectedWord,
    whyThisSense: selectedWord,
    shortExplanation: selectedWord,
    exampleSentence: clampFallbackText(input.sentence, 320) || input.sentence,
    translatedExample: "",
    synonyms: [],
    confidence: 0.2,
  };
}

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

function resolveResponseFormats(
  mode: "basic" | "advanced",
  preferences: {
    basic: ResponseFormatPreference;
    advanced: ResponseFormatPreference;
  },
) {
  if (mode === "basic") {
    if (preferences.basic === "json_object") {
      return [{ type: "json_object" as const }, undefined] as const;
    }
    if (preferences.basic === "none") {
      return [undefined] as const;
    }
    return [buildOpenAiResponseFormat(mode), { type: "json_object" as const }, undefined] as const;
  }

  if (preferences.advanced === "json_object") {
    return [{ type: "json_object" as const }, undefined] as const;
  }
  if (preferences.advanced === "none") {
    return [undefined] as const;
  }

  return [buildOpenAiResponseFormat(mode), { type: "json_object" as const }, undefined] as const;
}

export function createOpenAiWordInsightProvider(
  config: OpenAiWordInsightProviderConfig,
): WordInsightProvider {
  const baseUrl = (config.baseUrl ?? "https://api.openai.com/v1").replace(/\/+$/, "");
  const timeoutMs = config.timeoutMs ?? 15_000;
  const basicTimeoutMs = Math.min(timeoutMs, 8_000);
  const basicModel = config.basicModel ?? config.model;

  return {
    async explainWord(input) {
      const responseFormatPreferences: {
        basic: ResponseFormatPreference;
        advanced: ResponseFormatPreference;
      } = {
        basic: "json_schema",
        advanced: "json_schema",
      };
      const model = input.mode === "basic" ? basicModel : config.model;
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
      let lastModelContent: string | undefined;
      let lastParseError: unknown;
      let lastTerminalError: unknown;

      for (let attemptIndex = 0; attemptIndex < attempts.length; attemptIndex += 1) {
        const attempt = attempts[attemptIndex];
        if (!attempt) continue;
        const responseFormats = resolveResponseFormats(input.mode, responseFormatPreferences);

        for (let formatIndex = 0; formatIndex < responseFormats.length; formatIndex += 1) {
          const responseFormat = responseFormats[formatIndex];
          const controller = new AbortController();
          const timeout = setTimeout(() => controller.abort(), attempt.timeoutMs);

          try {
            const response = await withSpan(
              "ai.openai.chat_completions",
              async (span) => {
                const response = await fetch(`${baseUrl}/chat/completions`, {
                  method: "POST",
                  headers: {
                    "content-type": "application/json",
                    authorization: `Bearer ${config.apiKey}`,
                  },
                  signal: controller.signal,
                  body: JSON.stringify({
                    model,
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
                  "ai.provider": "openai",
                  "ai.model": model,
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
                const modeKey = input.mode === "advanced" ? "advanced" : "basic";
                if (responseFormat?.type === "json_schema") {
                  responseFormatPreferences[modeKey] = "json_object";
                } else if (responseFormat?.type === "json_object") {
                  responseFormatPreferences[modeKey] = "none";
                }
                const nextResponseFormat = responseFormats[formatIndex + 1];
                config.logger?.warn({
                  msg: "word_insight_openai_response_format_fallback",
                  status: response.status,
                  errorLength: text.length,
                  attempt: attemptIndex + 1,
                  from: responseFormat?.type ?? "none",
                  to: nextResponseFormat?.type ?? "none",
                  cachedPreference:
                    input.mode === "advanced"
                      ? responseFormatPreferences.advanced
                      : responseFormatPreferences.basic,
                });
                continue;
              }

              config.logger?.error({
                msg: "word_insight_openai_http_error",
                status: response.status,
                errorLength: text.length,
                errorPreview: text.slice(0, 240),
              });
              throw new Error(`word_insight_openai_http_${response.status}`);
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
                  msg: "word_insight_openai_parse_retry",
                  attempt: attemptIndex + 1,
                  reason: "empty_content",
                  finishReason: choice?.finish_reason ?? undefined,
                });
                break;
              }
              throw new Error("word_insight_openai_empty_message");
            }
            lastModelContent = content;

            try {
              const parsed = parseModelOutput(content, {
                mode: input.mode,
                sourceLang: input.sourceLang,
                targetLang: input.targetLang,
              });
              return toInsight(input, parsed, "openai", model);
            } catch (error) {
              if (attemptIndex < attempts.length - 1 && shouldRetryModelOutputError(error)) {
                config.logger?.warn({
                  msg: "word_insight_openai_parse_retry",
                  attempt: attemptIndex + 1,
                  reason: error instanceof Error ? error.message : "parse_error",
                  finishReason: choice?.finish_reason ?? undefined,
                });
                lastParseError = error;
                break;
              }
              if (input.mode === "basic" && shouldRetryModelOutputError(error)) {
                lastParseError = error;
                break;
              }
              throw error;
            }
          } catch (error) {
            if (error instanceof Error && error.name === "AbortError") {
              const timeoutError = new Error("word_insight_openai_timeout");
              if (input.mode === "basic") {
                lastTerminalError = timeoutError;
                break;
              }
              throw timeoutError;
            }
            if (input.mode === "basic") {
              lastTerminalError = error;
              break;
            }
            throw error;
          } finally {
            clearTimeout(timeout);
          }
        }
      }

      if (
        input.mode === "basic" &&
        typeof lastModelContent === "string" &&
        shouldRetryModelOutputError(lastParseError)
      ) {
        try {
          const parsed = parseModelOutput(lastModelContent, {
            mode: input.mode,
            sourceLang: input.sourceLang,
            targetLang: input.targetLang,
            allowIncompleteBasic: true,
          });
          config.logger?.warn({
            msg: "word_insight_openai_basic_salvage_success",
            reason:
              lastParseError instanceof Error ? lastParseError.message : "unknown_parse_error",
          });
          return toInsight(input, parsed, "openai", model);
        } catch (salvageError) {
          const lenientContent = normalizeLenientJsonContent(lastModelContent);
          try {
            const lenientParsed = parseModelOutput(lenientContent, {
              mode: input.mode,
              sourceLang: input.sourceLang,
              targetLang: input.targetLang,
              allowIncompleteBasic: true,
              lenientBasic: true,
            });
            config.logger?.warn({
              msg: "word_insight_openai_basic_lenient_salvage_success",
              reason:
                salvageError instanceof Error ? salvageError.message : "unknown_salvage_error",
            });
            return toInsight(input, lenientParsed, "openai", model);
          } catch (lenientError) {
            config.logger?.error({
              msg: "word_insight_openai_basic_salvage_failed",
              reason:
                lenientError instanceof Error ? lenientError.message : "unknown_lenient_error",
            });
          }
        }
      }

      const hardFallbackReason =
        lastParseError instanceof Error
          ? lastParseError
          : lastTerminalError instanceof Error
            ? lastTerminalError
            : undefined;
      if (input.mode === "basic" && shouldUseBasicHardFallback(hardFallbackReason)) {
        config.logger?.warn({
          msg: "word_insight_openai_basic_hard_fallback_used",
          reason: hardFallbackReason?.message ?? "unknown",
        });
        return toInsight(
          input,
          buildBasicHardFallbackOutput({
            selectedWord: input.selectedWord,
            sentence: input.sentence,
          }),
          "openai",
          model,
        );
      }

      if (lastParseError instanceof Error) {
        throw lastParseError;
      }
      throw new Error("word_insight_openai_empty_message");
    },
  };
}
