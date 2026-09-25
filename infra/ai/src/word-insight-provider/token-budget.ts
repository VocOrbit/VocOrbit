import type { WordInsightRequest } from "../../../../modules/word-insight/src/ports/word-insight-provider";

const OUTPUT_TOKEN_BUDGETS = {
  basic: {
    initial: 700,
    retry: 900,
  },
  advanced: {
    initial: 1_600,
    retry: 2_200,
  },
} as const;

export function resolveWordInsightOutputTokenBudget(mode: WordInsightRequest["mode"]) {
  return OUTPUT_TOKEN_BUDGETS[mode];
}
