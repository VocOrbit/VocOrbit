import type {
  ExerciseAnswer,
  ExerciseMode,
  ExerciseQuestion,
  ExerciseSessionDetail,
  ExerciseSessionStatus,
} from "../domain/exercise";

export interface ExerciseRepo {
  createSession(input: {
    session: {
      id: string;
      userId: string;
      mode: "basic" | "advanced";
      status: ExerciseSessionStatus;
      totalQuestions: number;
      requiredTodayQuestions: number;
      questionTypes: string[];
      timezoneOffsetMinutes: number;
    };
    questions: Array<{
      id: string;
      orderNo: number;
      type: ExerciseQuestion["type"];
      itemId: string;
      prompt: string;
      options: string[];
      correctAnswer: string;
      explanation?: string;
    }>;
  }): Promise<ExerciseSessionDetail>;
  getSessionDetail(input: {
    sessionId: string;
    userId: string;
  }): Promise<ExerciseSessionDetail | null>;
  submitAnswer(input: {
    sessionId: string;
    questionId: string;
    userId: string;
    answer: string;
  }): Promise<{
    answer: ExerciseAnswer;
    alreadyAnswered: boolean;
    detail: ExerciseSessionDetail;
    correctAnswer: string;
  } | null>;
  completeSession(input: {
    sessionId: string;
    userId: string;
  }): Promise<ExerciseSessionDetail | null>;
  getWeeklyAnalyticsData(input: {
    userId: string;
    from: Date;
    to: Date;
    mode?: ExerciseMode;
  }): Promise<{
    sessions: Array<{
      id: string;
      mode: ExerciseMode;
      status: ExerciseSessionStatus;
      createdAt: string;
      completedAt?: string;
    }>;
    answers: Array<{
      sessionId: string;
      questionId: string;
      mode: ExerciseMode;
      questionType: ExerciseQuestion["type"];
      itemId?: string;
      itemStatus?: "active" | "learned" | "deleted";
      prompt: string;
      isCorrect: boolean;
      answeredAt: string;
    }>;
  }>;
}
