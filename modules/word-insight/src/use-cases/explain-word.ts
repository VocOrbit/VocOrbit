import {
  ConflictError,
  ForbiddenError,
  UnauthorizedError,
} from "../../../../packages/core/src/errors";
import { newId } from "../../../../packages/core/src/ids";
import type { WordInsight } from "../domain/word-insight";
import type { WordInsightLanguagePreferencesReader } from "../ports/language-preferences";
import {
  type CreditBalances,
  type CreditSpend,
  type LookupMode,
  type WordInsightUsageRepo,
  remainingCreditsForMode,
} from "../ports/usage-repo";
import type { WordInsightProvider } from "../ports/word-insight-provider";
import { parseExplainWordInput } from "./explain-word-input";
import {
  buildExplainWordResponsePayload,
  normalizeExplainWordInsight,
  resolveExplainWordLemma,
} from "./explain-word-insight";
import { resolveExplainWordLanguages } from "./explain-word-language";
import { withSpan } from "../../../../packages/core/src/observability/tracing";

export type ExplainWordInput = {
  mode?: LookupMode;
  sentence: string;
  selectedWord: string;
  sourceLang?: string;
  targetLang?: string;
};

export type ExplainWordContext = {
  user: {
    id: string;
    name: string;
    email: string;
    role: "user" | "admin";
  };
  requestId?: string;
  preferredTargetLang?: string;
};

export type ExplainWordDeps = {
  languagePreferences: WordInsightLanguagePreferencesReader;
  provider: WordInsightProvider;
  usageRepo: WordInsightUsageRepo;
  defaults: {
    sourceLang: string;
    targetLang: string;
    maxSentenceChars: number;
    maxSelectedWordChars: number;
  };
};

export type ExplainWordResult = {
  mode: LookupMode;
  lookupId: string;
  insight: WordInsight;
  spend: CreditSpend;
  credits: CreditBalances;
};

export async function explainWord(
  deps: ExplainWordDeps,
  input: ExplainWordInput,
  context: ExplainWordContext,
): Promise<ExplainWordResult> {
  if (context.user.id === "anonymous") {
    throw new UnauthorizedError("Authenticated user is required");
  }

  const parsedInput = parseExplainWordInput(input, {
    maxSentenceChars: deps.defaults.maxSentenceChars,
    maxSelectedWordChars: deps.defaults.maxSelectedWordChars,
  });

  const { sourceLang, targetLang } = await withSpan(
    "word_insight.resolve_languages",
    () =>
      resolveExplainWordLanguages({
        languagePreferences: deps.languagePreferences,
        userId: context.user.id,
        sourceLang: input.sourceLang,
        targetLang: input.targetLang,
        preferredTargetLang: context.preferredTargetLang,
        defaults: {
          sourceLang: deps.defaults.sourceLang,
          targetLang: deps.defaults.targetLang,
        },
      }),
    {
      attributes: {
        "word_insight.mode": parsedInput.mode,
      },
    },
  );

  const beforeLookupCredits = await deps.usageRepo.getOrCreateBalances(context.user.id);
  if (remainingCreditsForMode(beforeLookupCredits, parsedInput.mode) <= 0) {
    throw new ForbiddenError(`Insufficient ${parsedInput.mode} credits`);
  }

  const startedAt = Date.now();
  const raw = await withSpan(
    "word_insight.provider_explain",
    () =>
      deps.provider.explainWord({
        mode: parsedInput.mode,
        sentence: parsedInput.sentence,
        selectedWord: parsedInput.selectedWord,
        sourceLang,
        targetLang,
        userContext: context.user,
      }),
    {
      attributes: {
        "word_insight.mode": parsedInput.mode,
        "word_insight.source_lang": sourceLang,
        "word_insight.target_lang": targetLang,
      },
    },
  );

  const insight = normalizeExplainWordInsight(raw);
  const normalizedLemma = resolveExplainWordLemma(insight, parsedInput.selectedWord);
  let usage: Awaited<ReturnType<WordInsightUsageRepo["recordSuccessfulLookup"]>>;
  try {
    usage = await withSpan(
      "word_insight.persist_lookup",
      () =>
        deps.usageRepo.recordSuccessfulLookup({
          requestId: context.requestId ?? newId(),
          userId: context.user.id,
          mode: parsedInput.mode,
          sentence: parsedInput.sentence,
          selectedWord: parsedInput.selectedWord,
          lemma: normalizedLemma,
          sourceLang,
          targetLang,
          aiProvider: insight.provider,
          aiModel: insight.model,
          responseSummary: {
            meaning: insight.translationL1 ?? insight.meaning,
            shortExplanation: insight.whyThisSense ?? insight.shortExplanation,
            confidence: insight.confidence,
          },
          responsePayload: buildExplainWordResponsePayload(insight),
          latencyMs: Math.max(0, Date.now() - startedAt),
        }),
      {
        attributes: {
          "word_insight.mode": parsedInput.mode,
          "word_insight.ai_provider": insight.provider,
          "word_insight.ai_model": insight.model,
        },
      },
    );
  } catch (error) {
    if ((error as { code?: string })?.code === "23505") {
      throw new ConflictError("Lookup request already processed");
    }
    throw error;
  }

  if (!usage) {
    throw new ConflictError("Credits changed during request, please retry");
  }

  return {
    mode: parsedInput.mode,
    lookupId: usage.lookupId,
    insight,
    spend: usage.spend,
    credits: usage.credits,
  };
}
