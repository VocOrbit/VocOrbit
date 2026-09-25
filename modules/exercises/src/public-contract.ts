import type {
  ExerciseCatalog,
  ExerciseMode,
  ExerciseQuestionType,
  ExerciseSessionDetail,
  ExerciseWeeklyAnalytics,
} from "./domain/exercise";
import type { ExerciseRepo } from "./ports/exercise-repo";
import type { ExerciseLanguagePreferencesReader } from "./ports/language-preferences";
import type { ExerciseWordSource } from "./ports/word-source";
import { completeExerciseSession } from "./use-cases/complete-session";
import {
  type CreateExerciseSessionContext,
  type CreateExerciseSessionInput,
  createExerciseSession,
} from "./use-cases/create-session";
import { getExerciseCatalog } from "./use-cases/get-catalog";
import { getExerciseSession } from "./use-cases/get-session";
import { getExerciseTodayPlan } from "./use-cases/get-today-plan";
import { getExerciseWeeklyAnalytics } from "./use-cases/get-weekly-analytics";
import { submitExerciseAnswer } from "./use-cases/submit-answer";

type ExerciseDeps = {
  repo: ExerciseRepo;
  wordSource: ExerciseWordSource;
  languagePreferences: ExerciseLanguagePreferencesReader;
  defaults: {
    totalQuestions: number;
    maxTotalQuestions: number;
    todayMinimum: number;
    maxTodayMinimum: number;
    maxLearningItemsScan: number;
  };
};

export interface ExercisesPublicContract {
  createSession(
    input: CreateExerciseSessionInput,
    context: CreateExerciseSessionContext,
  ): Promise<ExerciseSessionDetail>;
  getSession(input: { sessionId: string; userId: string }): Promise<ExerciseSessionDetail>;
  submitAnswer(input: {
    sessionId: string;
    questionId: string;
    userId: string;
    answer: string;
  }): Promise<{
    questionId: string;
    answer: string;
    isCorrect: boolean;
    correctAnswer: string;
    alreadyAnswered: boolean;
    progress: ExerciseSessionDetail["progress"];
    sessionStatus: ExerciseSessionDetail["session"]["status"];
  }>;
  completeSession(input: { sessionId: string; userId: string }): Promise<ExerciseSessionDetail>;
  getTodayPlan(input: {
    userId: string;
    mode?: "basic" | "advanced";
    timezoneOffsetMinutes?: number;
  }): Promise<{
    mode: "basic" | "advanced";
    timezoneOffsetMinutes: number;
    activeItemCount: number;
    modeItemCount: number;
    todayItemCount: number;
    recommendedTodayMinimum: number;
  }>;
  getCatalog(input: {
    userId: string;
    mode?: "basic" | "advanced";
    timezoneOffsetMinutes?: number;
    groupIds?: string[];
  }): Promise<ExerciseCatalog>;
  getWeeklyAnalytics(input: {
    userId: string;
    mode?: ExerciseMode;
    timezoneOffsetMinutes?: number;
  }): Promise<ExerciseWeeklyAnalytics>;
}

export type CreateExerciseSessionPublicInput = CreateExerciseSessionInput & {
  questionTypes?: ExerciseQuestionType[];
};

export function createExercisesPublicContract(deps: ExerciseDeps): ExercisesPublicContract {
  return {
    createSession(input, context) {
      return createExerciseSession(deps, input, context);
    },
    getSession(input) {
      return getExerciseSession(deps.repo, input);
    },
    submitAnswer(input) {
      return submitExerciseAnswer(deps.repo, input);
    },
    completeSession(input) {
      return completeExerciseSession(deps.repo, input);
    },
    getTodayPlan(input) {
      return getExerciseTodayPlan(
        {
          wordSource: deps.wordSource,
          defaults: {
            todayMinimum: deps.defaults.todayMinimum,
            maxLearningItemsScan: deps.defaults.maxLearningItemsScan,
          },
        },
        input,
      );
    },
    getCatalog(input) {
      return getExerciseCatalog(
        {
          wordSource: deps.wordSource,
          defaults: {
            maxLearningItemsScan: deps.defaults.maxLearningItemsScan,
          },
        },
        input,
      );
    },
    getWeeklyAnalytics(input) {
      return getExerciseWeeklyAnalytics(deps.repo, input);
    },
  };
}
