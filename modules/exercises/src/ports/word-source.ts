import type { ExerciseMode } from "../domain/exercise";

export type WordSourceLearningItem = {
  id: string;
  lemma: string;
  vocab: string;
  targetMeaning: string;
  lastMeaning: string;
  definitionL2: string;
  lastSeenMode: ExerciseMode;
  createdAt: string;
};

export type WordSourceLearningItemDetail = {
  id: string;
  sentence?: string;
  translatedExample?: string;
  synonyms: string[];
  meaning?: string;
  shortExplanation?: string;
};

export interface ExerciseWordSource {
  listActiveLearningItems(input: {
    userId: string;
    limit: number;
    groupIds?: string[];
  }): Promise<WordSourceLearningItem[]>;
  getLearningItemDetail(input: {
    userId: string;
    itemId: string;
  }): Promise<WordSourceLearningItemDetail | null>;
}
