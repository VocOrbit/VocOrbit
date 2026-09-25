import {
  NotFoundError,
  UnauthorizedError,
  ValidationError,
} from "../../../../packages/core/src/errors";
import type { ExerciseRepo } from "../ports/exercise-repo";

export async function submitExerciseAnswer(
  repo: ExerciseRepo,
  input: {
    sessionId: string;
    questionId: string;
    userId: string;
    answer: string;
  },
) {
  if (!input.userId) throw new UnauthorizedError("Authenticated user is required");
  const answer = input.answer.trim();
  if (!answer) throw new ValidationError("answer is required");

  const result = await repo.submitAnswer({
    sessionId: input.sessionId,
    questionId: input.questionId,
    userId: input.userId,
    answer,
  });
  if (!result) throw new NotFoundError("Exercise session or question not found");

  return {
    questionId: result.answer.questionId,
    answer: result.answer.answer,
    isCorrect: result.answer.isCorrect,
    correctAnswer: result.correctAnswer,
    alreadyAnswered: result.alreadyAnswered,
    progress: result.detail.progress,
    sessionStatus: result.detail.session.status,
  };
}
