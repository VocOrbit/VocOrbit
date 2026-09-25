import { NotFoundError, UnauthorizedError } from "../../../../packages/core/src/errors";
import type { ExerciseSessionDetail } from "../domain/exercise";
import type { ExerciseRepo } from "../ports/exercise-repo";

export async function getExerciseSession(
  repo: ExerciseRepo,
  input: { sessionId: string; userId: string },
): Promise<ExerciseSessionDetail> {
  if (!input.userId) throw new UnauthorizedError("Authenticated user is required");
  const detail = await repo.getSessionDetail(input);
  if (!detail) throw new NotFoundError("Exercise session not found");
  return detail;
}
