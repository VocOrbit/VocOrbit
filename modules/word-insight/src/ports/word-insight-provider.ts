import type { WordInsight } from "../domain/word-insight";
import type { LookupMode } from "./usage-repo";

export type WordInsightRequest = {
  mode: LookupMode;
  sentence: string;
  selectedWord: string;
  sourceLang: string;
  targetLang: string;
  userContext: {
    id: string;
    name: string;
    email: string;
    role: "user" | "admin";
  };
};

export interface WordInsightProvider {
  explainWord(input: WordInsightRequest): Promise<WordInsight>;
}
