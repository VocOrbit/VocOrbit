import { and, asc, desc, eq, gte, inArray, lt } from "drizzle-orm";
import type { PostgresJsDatabase } from "drizzle-orm/postgres-js";
import type {
  ExerciseAnswer,
  ExerciseMode,
  ExerciseQuestion,
  ExerciseQuestionType,
  ExerciseSession,
  ExerciseSessionDetail,
  ExerciseSessionProgress,
  ExerciseSessionStatus,
} from "../../../../../modules/exercises/src/domain/exercise";
import type { ExerciseRepo } from "../../../../../modules/exercises/src/ports/exercise-repo";
import { newId } from "../../../../../packages/core/src/ids";
import { exerciseAnswers, exerciseQuestions, exerciseSessions, learningItems } from "../../schema";

function mapSession(row: typeof exerciseSessions.$inferSelect): ExerciseSession {
  return {
    id: row.id,
    userId: row.userId,
    mode: row.mode as ExerciseSession["mode"],
    status: row.status as ExerciseSession["status"],
    totalQuestions: row.totalQuestions,
    requiredTodayQuestions: row.requiredTodayQuestions,
    questionTypes: Array.isArray(row.questionTypes)
      ? (row.questionTypes as ExerciseQuestionType[])
      : [],
    timezoneOffsetMinutes: row.timezoneOffsetMinutes,
    createdAt: row.createdAt.toISOString(),
    updatedAt: row.updatedAt.toISOString(),
    completedAt: row.completedAt ? row.completedAt.toISOString() : undefined,
  };
}

function mapAnswer(row: typeof exerciseAnswers.$inferSelect): ExerciseAnswer {
  return {
    id: row.id,
    sessionId: row.sessionId,
    questionId: row.questionId,
    userId: row.userId,
    answer: row.answer,
    isCorrect: row.isCorrect,
    createdAt: row.createdAt.toISOString(),
  };
}

function toProgress(session: ExerciseSession, answers: ExerciseAnswer[]): ExerciseSessionProgress {
  const answeredQuestions = answers.length;
  const correctAnswers = answers.filter((answer) => answer.isCorrect).length;
  const scorePercent =
    session.totalQuestions > 0 ? Math.round((correctAnswers / session.totalQuestions) * 100) : 0;
  return {
    totalQuestions: session.totalQuestions,
    answeredQuestions,
    correctAnswers,
    scorePercent,
  };
}

type ExerciseQuestionRow = typeof exerciseQuestions.$inferSelect;

function mapQuestion(
  row: ExerciseQuestionRow,
  answer?: ExerciseAnswer,
): ExerciseSessionDetail["questions"][number] {
  return {
    id: row.id,
    orderNo: row.orderNo,
    type: row.type as ExerciseQuestion["type"],
    itemId: row.itemId ?? "",
    prompt: row.prompt,
    options: Array.isArray(row.options) ? row.options : [],
    explanation: row.explanation ?? undefined,
    answered: Boolean(answer),
    answer: answer?.answer,
    isCorrect: answer?.isCorrect,
  };
}

async function loadDetail(
  db: Pick<PostgresJsDatabase, "select">,
  input: { sessionId: string; userId: string },
): Promise<ExerciseSessionDetail | null> {
  const sessionRows = await db
    .select()
    .from(exerciseSessions)
    .where(and(eq(exerciseSessions.id, input.sessionId), eq(exerciseSessions.userId, input.userId)))
    .limit(1);
  const sessionRow = sessionRows[0];
  if (!sessionRow) return null;

  const questionRows = await db
    .select()
    .from(exerciseQuestions)
    .where(eq(exerciseQuestions.sessionId, input.sessionId))
    .orderBy(asc(exerciseQuestions.orderNo));

  const itemIds = Array.from(
    new Set(
      questionRows.map((row) => row.itemId).filter((itemId): itemId is string => Boolean(itemId)),
    ),
  );
  const deletedItemIds =
    itemIds.length > 0
      ? new Set(
          (
            await db
              .select({
                id: learningItems.id,
              })
              .from(learningItems)
              .where(
                and(
                  eq(learningItems.userId, input.userId),
                  eq(learningItems.status, "deleted"),
                  inArray(learningItems.id, itemIds),
                ),
              )
          ).map((row) => row.id),
        )
      : new Set<string>();
  const filteredQuestionRows = questionRows.filter(
    (row) => !row.itemId || !deletedItemIds.has(row.itemId),
  );

  const answerRows = await db
    .select()
    .from(exerciseAnswers)
    .where(
      and(eq(exerciseAnswers.sessionId, input.sessionId), eq(exerciseAnswers.userId, input.userId)),
    );

  const answers = answerRows.map(mapAnswer);
  const answerByQuestionId = new Map(answers.map((answer) => [answer.questionId, answer]));
  const session = mapSession(sessionRow);
  if (session.totalQuestions !== filteredQuestionRows.length) {
    session.totalQuestions = filteredQuestionRows.length;
    session.requiredTodayQuestions = Math.min(
      session.requiredTodayQuestions,
      filteredQuestionRows.length,
    );
  }
  const filteredAnswers = filteredQuestionRows
    .map((row) => answerByQuestionId.get(row.id))
    .filter((answer): answer is ExerciseAnswer => Boolean(answer));
  const progress = toProgress(session, filteredAnswers);

  return {
    session,
    progress,
    questions: filteredQuestionRows.map((row) => mapQuestion(row, answerByQuestionId.get(row.id))),
  };
}

export function createExercisesRepo(db: PostgresJsDatabase): ExerciseRepo {
  return {
    async createSession(input) {
      return await db.transaction(async (tx) => {
        const now = new Date();
        await tx.insert(exerciseSessions).values({
          id: input.session.id,
          userId: input.session.userId,
          mode: input.session.mode,
          status: input.session.status,
          totalQuestions: input.session.totalQuestions,
          requiredTodayQuestions: input.session.requiredTodayQuestions,
          questionTypes: input.session.questionTypes,
          timezoneOffsetMinutes: input.session.timezoneOffsetMinutes,
          createdAt: now,
          updatedAt: now,
        });

        if (input.questions.length > 0) {
          await tx.insert(exerciseQuestions).values(
            input.questions.map((question) => ({
              id: question.id,
              sessionId: input.session.id,
              userId: input.session.userId,
              orderNo: question.orderNo,
              type: question.type,
              itemId: question.itemId,
              prompt: question.prompt,
              options: question.options,
              correctAnswer: question.correctAnswer,
              explanation: question.explanation ?? null,
              createdAt: now,
            })),
          );
        }

        const detail = await loadDetail(tx, {
          sessionId: input.session.id,
          userId: input.session.userId,
        });
        if (!detail) throw new Error("Failed to load created exercise session");
        return detail;
      });
    },

    async getSessionDetail(input) {
      return await loadDetail(db, input);
    },

    async submitAnswer(input) {
      return await db.transaction(async (tx) => {
        const sessionRows = await tx
          .select()
          .from(exerciseSessions)
          .where(
            and(
              eq(exerciseSessions.id, input.sessionId),
              eq(exerciseSessions.userId, input.userId),
            ),
          )
          .limit(1);
        const session = sessionRows[0];
        if (!session) return null;

        const questionRows = await tx
          .select()
          .from(exerciseQuestions)
          .where(
            and(
              eq(exerciseQuestions.id, input.questionId),
              eq(exerciseQuestions.sessionId, input.sessionId),
              eq(exerciseQuestions.userId, input.userId),
            ),
          )
          .limit(1);
        const question = questionRows[0];
        if (!question) return null;

        if (question.itemId) {
          const itemRows = await tx
            .select({
              status: learningItems.status,
            })
            .from(learningItems)
            .where(
              and(eq(learningItems.id, question.itemId), eq(learningItems.userId, input.userId)),
            )
            .limit(1);
          if (itemRows[0]?.status === "deleted") {
            return null;
          }
        }

        const normalizedAnswer = input.answer.trim();
        const isCorrect =
          normalizedAnswer.toLocaleLowerCase("en-US") ===
          question.correctAnswer.trim().toLocaleLowerCase("en-US");
        const now = new Date();

        const insertedAnswers = await tx
          .insert(exerciseAnswers)
          .values({
            id: newId(),
            sessionId: input.sessionId,
            questionId: input.questionId,
            userId: input.userId,
            answer: normalizedAnswer,
            isCorrect,
            createdAt: now,
          })
          .onConflictDoNothing({ target: exerciseAnswers.questionId })
          .returning();

        const alreadyAnswered = insertedAnswers.length === 0;
        const answerRow =
          insertedAnswers[0] ??
          (
            await tx
              .select()
              .from(exerciseAnswers)
              .where(
                and(
                  eq(exerciseAnswers.sessionId, input.sessionId),
                  eq(exerciseAnswers.questionId, input.questionId),
                  eq(exerciseAnswers.userId, input.userId),
                ),
              )
              .limit(1)
          )[0];
        if (!answerRow) {
          throw new Error("Failed to load exercise answer");
        }

        await tx
          .update(exerciseSessions)
          .set({ updatedAt: now })
          .where(eq(exerciseSessions.id, input.sessionId));

        let detail = await loadDetail(tx, {
          sessionId: input.sessionId,
          userId: input.userId,
        });
        if (!detail) {
          throw new Error("Failed to load exercise session after answer");
        }

        if (
          detail.session.status === "active" &&
          detail.progress.answeredQuestions >= detail.session.totalQuestions
        ) {
          await tx
            .update(exerciseSessions)
            .set({
              status: "completed",
              completedAt: now,
              updatedAt: now,
            })
            .where(eq(exerciseSessions.id, input.sessionId));

          const completed = await loadDetail(tx, {
            sessionId: input.sessionId,
            userId: input.userId,
          });
          if (completed) detail = completed;
        }

        return {
          answer: mapAnswer(answerRow),
          alreadyAnswered,
          detail,
          correctAnswer: question.correctAnswer,
        };
      });
    },

    async completeSession(input) {
      return await db.transaction(async (tx) => {
        const existing = await tx
          .select()
          .from(exerciseSessions)
          .where(
            and(
              eq(exerciseSessions.id, input.sessionId),
              eq(exerciseSessions.userId, input.userId),
            ),
          )
          .limit(1);
        if (!existing[0]) return null;

        if (existing[0].status !== "completed") {
          const now = new Date();
          await tx
            .update(exerciseSessions)
            .set({
              status: "completed",
              completedAt: now,
              updatedAt: now,
            })
            .where(eq(exerciseSessions.id, input.sessionId));
        }

        return await loadDetail(tx, input);
      });
    },

    async getWeeklyAnalyticsData(input) {
      const modeCondition = input.mode ? eq(exerciseSessions.mode, input.mode) : undefined;

      const sessionRows = await db
        .select({
          id: exerciseSessions.id,
          mode: exerciseSessions.mode,
          status: exerciseSessions.status,
          createdAt: exerciseSessions.createdAt,
          completedAt: exerciseSessions.completedAt,
        })
        .from(exerciseSessions)
        .where(
          and(
            eq(exerciseSessions.userId, input.userId),
            gte(exerciseSessions.createdAt, input.from),
            lt(exerciseSessions.createdAt, input.to),
            modeCondition,
          ),
        );

      const answerRows = await db
        .select({
          sessionId: exerciseAnswers.sessionId,
          questionId: exerciseAnswers.questionId,
          mode: exerciseSessions.mode,
          questionType: exerciseQuestions.type,
          itemId: exerciseQuestions.itemId,
          itemStatus: learningItems.status,
          prompt: exerciseQuestions.prompt,
          isCorrect: exerciseAnswers.isCorrect,
          answeredAt: exerciseAnswers.createdAt,
        })
        .from(exerciseAnswers)
        .innerJoin(
          exerciseQuestions,
          and(
            eq(exerciseQuestions.id, exerciseAnswers.questionId),
            eq(exerciseQuestions.userId, input.userId),
          ),
        )
        .innerJoin(
          exerciseSessions,
          and(
            eq(exerciseSessions.id, exerciseAnswers.sessionId),
            eq(exerciseSessions.userId, input.userId),
          ),
        )
        .leftJoin(
          learningItems,
          and(
            eq(learningItems.id, exerciseQuestions.itemId),
            eq(learningItems.userId, input.userId),
          ),
        )
        .where(
          and(
            eq(exerciseAnswers.userId, input.userId),
            gte(exerciseAnswers.createdAt, input.from),
            lt(exerciseAnswers.createdAt, input.to),
            modeCondition,
          ),
        )
        .orderBy(desc(exerciseAnswers.createdAt));

      return {
        sessions: sessionRows.map((row) => ({
          id: row.id,
          mode: row.mode as ExerciseMode,
          status: row.status as ExerciseSessionStatus,
          createdAt: row.createdAt.toISOString(),
          completedAt: row.completedAt ? row.completedAt.toISOString() : undefined,
        })),
        answers: answerRows.map((row) => ({
          sessionId: row.sessionId,
          questionId: row.questionId,
          mode: row.mode as ExerciseMode,
          questionType: row.questionType as ExerciseQuestionType,
          itemId: row.itemId ?? undefined,
          itemStatus:
            row.itemStatus === "active" ||
            row.itemStatus === "learned" ||
            row.itemStatus === "deleted"
              ? row.itemStatus
              : undefined,
          prompt: row.prompt,
          isCorrect: row.isCorrect,
          answeredAt: row.answeredAt.toISOString(),
        })),
      };
    },
  };
}
