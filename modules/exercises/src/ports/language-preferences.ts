export type ExerciseLanguagePreferences = {
  l1Language: string;
  l2Language: string;
};

export interface ExerciseLanguagePreferencesReader {
  getByUserId(userId: string): Promise<ExerciseLanguagePreferences | null>;
}
