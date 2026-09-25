import { NotFoundError, UnauthorizedError } from "../../../../packages/core/src/errors";
import type { ExplainJobRecord, WordInsightExplainJobRepo } from "../ports/explain-job-repo";

export async function getExplainJob(
  jobs: WordInsightExplainJobRepo,
  input: {
    userId: string;
    jobId: string;
  },
): Promise<ExplainJobRecord> {
  if (!input.userId || input.userId === "anonymous") {
    throw new UnauthorizedError("Authenticated user is required");
  }

  const job = await jobs.getByIdForUser({
    jobId: input.jobId,
    userId: input.userId,
  });
  if (!job) {
    throw new NotFoundError("Word insight job not found");
  }
  return job;
}
