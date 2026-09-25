import { ValidationError } from "../../../../packages/core/src/errors";
import { sanitizePlainText } from "../../../../packages/core/src/security/sanitize";
import type { LookupMode } from "../ports/usage-repo";

export type ParsedExplainWordInput = {
  mode: LookupMode;
  sentence: string;
  selectedWord: string;
};

type ParseInput = {
  mode?: LookupMode;
  sentence: string;
  selectedWord: string;
};

type ParseInputLimits = {
  maxSentenceChars: number;
  maxSelectedWordChars: number;
};

function normalizeMode(value: string | undefined): LookupMode {
  if (!value) return "basic";
  if (value === "basic" || value === "advanced") return value;
  throw new ValidationError("mode must be 'basic' or 'advanced'");
}

function cleanWord(value: string, maxChars: number): string {
  const cleaned = sanitizePlainText(value).trim();
  if (!cleaned) {
    throw new ValidationError("selectedWord is required");
  }
  if (cleaned.length > maxChars) {
    throw new ValidationError(`selectedWord exceeds max length (${maxChars})`);
  }
  return cleaned;
}

function cleanSentence(value: string, maxChars: number): string {
  const cleaned = sanitizePlainText(value).trim();
  if (!cleaned) {
    throw new ValidationError("sentence is required");
  }
  if (cleaned.length > maxChars) {
    throw new ValidationError(`sentence exceeds max length (${maxChars})`);
  }
  return cleaned;
}

function ensureWordExistsInSentence(sentence: string, selectedWord: string) {
  const sentenceLc = sentence.toLocaleLowerCase("en-US");
  const wordLc = selectedWord.toLocaleLowerCase("en-US");
  if (!sentenceLc.includes(wordLc)) {
    throw new ValidationError("selectedWord was not found in sentence");
  }
}

export function parseExplainWordInput(
  input: ParseInput,
  limits: ParseInputLimits,
): ParsedExplainWordInput {
  const mode = normalizeMode(input.mode);
  const sentence = cleanSentence(input.sentence, limits.maxSentenceChars);
  const selectedWord = cleanWord(input.selectedWord, limits.maxSelectedWordChars);
  ensureWordExistsInSentence(sentence, selectedWord);

  return {
    mode,
    sentence,
    selectedWord,
  };
}
