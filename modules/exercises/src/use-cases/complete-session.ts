import { NotFoundError, UnauthorizedError } from "../../../../packages/core/src/errors";
import type { ExerciseSessionDetail } from "../domain/exercise";
import type { ExerciseRepo } from "../ports/exercise-repo";

export async function completeExerciseSession(
  repo: ExerciseRepo,
  input: { sessionId: string; userId: string },
): Promise<ExerciseSessionDetail> {
  if (!input.userId) throw new UnauthorizedError("Authenticated user is required");
  const completed = await repo.completeSession(input);
  if (!completed) throw new NotFoundError("Exercise session not found");
  return completed;
}
