import type { Logger } from "../../../../packages/core/src/logger";

export type OpenAiWordInsightProviderConfig = {
  apiKey: string;
  model: string;
  basicModel?: string;
  baseUrl?: string;
  timeoutMs?: number;
  logger?: Logger;
};

export type DeepSeekWordInsightProviderConfig = {
  apiKey: string;
  model: string;
  baseUrl?: string;
  timeoutMs?: number;
  logger?: Logger;
};

export type ParsedModelOutput = {
  surface?: string;
  lemma?: string;
  phonetic?: string;
  partOfSpeech?: string;
  sourceMeaning?: string;
  definitionL2?: string;
  translationL1?: string;
  whyThisSense?: string;
  meaning?: string;
  shortExplanation?: string;
  exampleSentence?: string;
  translatedExample?: string;
  synonyms?: string[];
  confidence?: number;
  details?: Record<string, unknown>;
};
