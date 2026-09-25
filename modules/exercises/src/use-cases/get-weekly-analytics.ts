import { UnauthorizedError } from "../../../../packages/core/src/errors";
import type {
  ExerciseMode,
  ExerciseQuestionType,
  ExerciseWeeklyAnalytics,
  ExerciseWeeklyAnalyticsByMode,
  ExerciseWeeklyAnalyticsByType,
  ExerciseWeeklyAnalyticsDay,
  ExerciseWeeklyWeakItem,
} from "../domain/exercise";
import type { ExerciseRepo } from "../ports/exercise-repo";
import { endOfDayUtc, parseTimezoneOffsetMinutes, startOfDayUtc } from "./session-shared";

const DAY_MS = 24 * 60 * 60 * 1_000;
const QUESTION_TYPE_ORDER: ExerciseQuestionType[] = [
  "meaning_match",
  "guess_word",
  "fill_in_gap",
  "match_synonym",
];
const MODE_ORDER: ExerciseMode[] = ["basic", "advanced"];

function toLocalDateKey(input: Date, timezoneOffsetMinutes: number): string {
  const local = new Date(input.getTime() + timezoneOffsetMinutes * 60_000);
  return local.toISOString().slice(0, 10);
}

function toAccuracyPercent(correct: number, total: number): number {
  if (total <= 0) return 0;
  return Math.round((correct / total) * 100);
}

export async function getExerciseWeeklyAnalytics(
  repo: ExerciseRepo,
  input: {
    userId: string;
    mode?: ExerciseMode;
    timezoneOffsetMinutes?: number;
  },
): Promise<ExerciseWeeklyAnalytics> {
  if (!input.userId) throw new UnauthorizedError("Authenticated user is required");

  const timezoneOffsetMinutes = parseTimezoneOffsetMinutes(input.timezoneOffsetMinutes);
  const now = new Date();
  const todayStartUtc = startOfDayUtc(now, timezoneOffsetMinutes);
  const windowStartUtc = new Date(todayStartUtc.getTime() - 6 * DAY_MS);
  const windowEndUtc = endOfDayUtc(todayStartUtc);

  const raw = await repo.getWeeklyAnalyticsData({
    userId: input.userId,
    from: windowStartUtc,
    to: windowEndUtc,
    mode: input.mode,
  });

  const dateKeys: string[] = [];
  for (let index = 0; index < 7; index += 1) {
    dateKeys.push(
      toLocalDateKey(new Date(windowStartUtc.getTime() + index * DAY_MS), timezoneOffsetMinutes),
    );
  }

  const dailyMap = new Map<string, { answeredQuestions: number; correctAnswers: number }>(
    dateKeys.map((date) => [date, { answeredQuestions: 0, correctAnswers: 0 }]),
  );
  const byTypeMap = new Map<
    ExerciseQuestionType,
    { answeredQuestions: number; correctAnswers: number }
  >(QUESTION_TYPE_ORDER.map((type) => [type, { answeredQuestions: 0, correctAnswers: 0 }]));
  const byModeMap = new Map<ExerciseMode, { answeredQuestions: number; correctAnswers: number }>(
    MODE_ORDER.map((mode) => [mode, { answeredQuestions: 0, correctAnswers: 0 }]),
  );
  const weakItemMap = new Map<
    string,
    {
      itemId: string;
      type: ExerciseQuestionType;
      prompt: string;
      wrongAnswers: number;
      totalAnswers: number;
      correctAnswers: number;
      lastAnsweredAt: string;
    }
  >();

  let correctAnswers = 0;
  for (const answer of raw.answers) {
    const answeredAt = new Date(answer.answeredAt);
    const dateKey = toLocalDateKey(answeredAt, timezoneOffsetMinutes);
    const daily = dailyMap.get(dateKey);
    if (daily) {
      daily.answeredQuestions += 1;
      if (answer.isCorrect) daily.correctAnswers += 1;
    }

    const byType = byTypeMap.get(answer.questionType);
    if (byType) {
      byType.answeredQuestions += 1;
      if (answer.isCorrect) byType.correctAnswers += 1;
    }

    const byMode = byModeMap.get(answer.mode);
    if (byMode) {
      byMode.answeredQuestions += 1;
      if (answer.isCorrect) byMode.correctAnswers += 1;
    }

    if (answer.isCorrect) {
      correctAnswers += 1;
    }

    if (answer.itemId && answer.itemStatus === "active") {
      const existing = weakItemMap.get(answer.itemId);
      if (!existing) {
        weakItemMap.set(answer.itemId, {
          itemId: answer.itemId,
          type: answer.questionType,
          prompt: answer.prompt,
          wrongAnswers: answer.isCorrect ? 0 : 1,
          totalAnswers: 1,
          correctAnswers: answer.isCorrect ? 1 : 0,
          lastAnsweredAt: answer.answeredAt,
        });
      } else {
        existing.totalAnswers += 1;
        if (answer.isCorrect) {
          existing.correctAnswers += 1;
        } else {
          existing.wrongAnswers += 1;
        }
        if (Date.parse(answer.answeredAt) > Date.parse(existing.lastAnsweredAt)) {
          existing.lastAnsweredAt = answer.answeredAt;
        }
      }
    }
  }

  const daily: ExerciseWeeklyAnalyticsDay[] = dateKeys.map((date) => {
    const day = dailyMap.get(date) ?? { answeredQuestions: 0, correctAnswers: 0 };
    return {
      date,
      answeredQuestions: day.answeredQuestions,
      correctAnswers: day.correctAnswers,
      accuracyPercent: toAccuracyPercent(day.correctAnswers, day.answeredQuestions),
    };
  });

  const activeDays = daily.filter((day) => day.answeredQuestions > 0).length;
  let streakDays = 0;
  for (let index = daily.length - 1; index >= 0; index -= 1) {
    const day = daily[index];
    if (!day || day.answeredQuestions <= 0) break;
    streakDays += 1;
  }

  const byType: ExerciseWeeklyAnalyticsByType[] = QUESTION_TYPE_ORDER.map((type) => {
    const stats = byTypeMap.get(type) ?? { answeredQuestions: 0, correctAnswers: 0 };
    return {
      type,
      answeredQuestions: stats.answeredQuestions,
      correctAnswers: stats.correctAnswers,
      accuracyPercent: toAccuracyPercent(stats.correctAnswers, stats.answeredQuestions),
    };
  });

  const byMode: ExerciseWeeklyAnalyticsByMode[] = MODE_ORDER.map((mode) => {
    const stats = byModeMap.get(mode) ?? { answeredQuestions: 0, correctAnswers: 0 };
    return {
      mode,
      answeredQuestions: stats.answeredQuestions,
      correctAnswers: stats.correctAnswers,
      accuracyPercent: toAccuracyPercent(stats.correctAnswers, stats.answeredQuestions),
    };
  });

  const weakItems: ExerciseWeeklyWeakItem[] = [...weakItemMap.values()]
    .filter((item) => item.wrongAnswers > 0)
    .sort((left, right) => {
      if (right.wrongAnswers !== left.wrongAnswers) {
        return right.wrongAnswers - left.wrongAnswers;
      }
      if (right.totalAnswers !== left.totalAnswers) {
        return right.totalAnswers - left.totalAnswers;
      }
      return Date.parse(right.lastAnsweredAt) - Date.parse(left.lastAnsweredAt);
    })
    .slice(0, 10)
    .map((item) => ({
      itemId: item.itemId,
      type: item.type,
      prompt: item.prompt,
      wrongAnswers: item.wrongAnswers,
      totalAnswers: item.totalAnswers,
      accuracyPercent: toAccuracyPercent(item.correctAnswers, item.totalAnswers),
      lastAnsweredAt: item.lastAnsweredAt,
    }));

  const answeredQuestions = raw.answers.length;
  const sessionsCompleted = raw.sessions.filter((session) => session.status === "completed").length;

  return {
    mode: input.mode ?? "all",
    timezoneOffsetMinutes,
    windowStartDate: dateKeys[0] ?? toLocalDateKey(windowStartUtc, timezoneOffsetMinutes),
    windowEndDate:
      dateKeys[dateKeys.length - 1] ??
      toLocalDateKey(new Date(windowEndUtc.getTime() - 1), timezoneOffsetMinutes),
    summary: {
      sessionsCreated: raw.sessions.length,
      sessionsCompleted,
      answeredQuestions,
      correctAnswers,
      accuracyPercent: toAccuracyPercent(correctAnswers, answeredQuestions),
      activeDays,
      streakDays,
    },
    daily,
    byType,
    byMode,
    weakItems,
  };
}
