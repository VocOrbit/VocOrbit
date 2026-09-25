export type ExerciseMode = "basic" | "advanced";
export type ExerciseAnalyticsMode = ExerciseMode | "all";

export type ExerciseQuestionType =
  | "meaning_match"
  | "fill_in_gap"
  | "guess_word"
  | "match_synonym";

export type ExerciseCatalogAvailabilityReason =
  | "not_enough_learning_items"
  | "missing_synonyms";

export type ExerciseCatalogItem = {
  type: ExerciseQuestionType;
  available: boolean;
  availableItemCount: number;
  reason?: ExerciseCatalogAvailabilityReason;
};

export type ExerciseCatalog = {
  mode: ExerciseMode;
  timezoneOffsetMinutes: number;
  activeItemCount: number;
  items: ExerciseCatalogItem[];
};

export type ExerciseSessionStatus = "active" | "completed";

export type ExerciseSession = {
  id: string;
  userId: string;
  mode: ExerciseMode;
  status: ExerciseSessionStatus;
  totalQuestions: number;
  requiredTodayQuestions: number;
  questionTypes: ExerciseQuestionType[];
  timezoneOffsetMinutes: number;
  createdAt: string;
  updatedAt: string;
  completedAt?: string;
};

export type ExerciseQuestion = {
  id: string;
  sessionId: string;
  userId: string;
  orderNo: number;
  type: ExerciseQuestionType;
  itemId: string;
  prompt: string;
  options: string[];
  correctAnswer: string;
  explanation?: string;
  createdAt: string;
};

export type ExerciseAnswer = {
  id: string;
  sessionId: string;
  questionId: string;
  userId: string;
  answer: string;
  isCorrect: boolean;
  createdAt: string;
};

export type ExerciseSessionProgress = {
  totalQuestions: number;
  answeredQuestions: number;
  correctAnswers: number;
  scorePercent: number;
};

export type ExerciseSessionDetail = {
  session: ExerciseSession;
  progress: ExerciseSessionProgress;
  questions: Array<{
    id: string;
    orderNo: number;
    type: ExerciseQuestionType;
    itemId: string;
    prompt: string;
    options: string[];
    explanation?: string;
    answered: boolean;
    answer?: string;
    isCorrect?: boolean;
  }>;
};

export type ExerciseWeeklyAnalyticsSummary = {
  sessionsCreated: number;
  sessionsCompleted: number;
  answeredQuestions: number;
  correctAnswers: number;
  accuracyPercent: number;
  activeDays: number;
  streakDays: number;
};

export type ExerciseWeeklyAnalyticsDay = {
  date: string;
  answeredQuestions: number;
  correctAnswers: number;
  accuracyPercent: number;
};

export type ExerciseWeeklyAnalyticsByType = {
  type: ExerciseQuestionType;
  answeredQuestions: number;
  correctAnswers: number;
  accuracyPercent: number;
};

export type ExerciseWeeklyAnalyticsByMode = {
  mode: ExerciseMode;
  answeredQuestions: number;
  correctAnswers: number;
  accuracyPercent: number;
};

export type ExerciseWeeklyWeakItem = {
  itemId: string;
  type: ExerciseQuestionType;
  prompt: string;
  wrongAnswers: number;
  totalAnswers: number;
  accuracyPercent: number;
  lastAnsweredAt: string;
};

export type ExerciseWeeklyAnalytics = {
  mode: ExerciseAnalyticsMode;
  timezoneOffsetMinutes: number;
  windowStartDate: string;
  windowEndDate: string;
  summary: ExerciseWeeklyAnalyticsSummary;
  daily: ExerciseWeeklyAnalyticsDay[];
  byType: ExerciseWeeklyAnalyticsByType[];
  byMode: ExerciseWeeklyAnalyticsByMode[];
  weakItems: ExerciseWeeklyWeakItem[];
};
