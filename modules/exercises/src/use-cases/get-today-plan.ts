import { UnauthorizedError } from "../../../../packages/core/src/errors";
import type { ExerciseWordSource } from "../ports/word-source";
import {
  endOfDayUtc,
  parseMode,
  parseTimezoneOffsetMinutes,
  startOfDayUtc,
} from "./session-shared";

export async function getExerciseTodayPlan(
  deps: {
    wordSource: ExerciseWordSource;
    defaults: {
      todayMinimum: number;
      maxLearningItemsScan: number;
    };
  },
  input: {
    userId: string;
    mode?: "basic" | "advanced";
    timezoneOffsetMinutes?: number;
  },
) {
  if (!input.userId) throw new UnauthorizedError("Authenticated user is required");

  const mode = parseMode(input.mode);
  const timezoneOffsetMinutes = parseTimezoneOffsetMinutes(input.timezoneOffsetMinutes);
  const items = await deps.wordSource.listActiveLearningItems({
    userId: input.userId,
    limit: deps.defaults.maxLearningItemsScan,
  });

  const now = new Date();
  const start = startOfDayUtc(now, timezoneOffsetMinutes);
  const end = endOfDayUtc(start);

  const modeItems = items.filter((item) => item.lastSeenMode === mode);
  const todayItems = modeItems.filter((item) => {
    const created = Date.parse(item.createdAt);
    return created >= start.getTime() && created < end.getTime();
  });

  return {
    mode,
    timezoneOffsetMinutes,
    activeItemCount: items.length,
    modeItemCount: modeItems.length,
    todayItemCount: todayItems.length,
    recommendedTodayMinimum: Math.min(todayItems.length, deps.defaults.todayMinimum),
  };
}
