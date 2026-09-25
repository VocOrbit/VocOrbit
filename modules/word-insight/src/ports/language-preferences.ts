export type WordInsightLanguagePreferences = {
  l1Language: string;
  l2Language: string;
};

export interface WordInsightLanguagePreferencesReader {
  getByUserId(userId: string): Promise<WordInsightLanguagePreferences | null>;
}
