import { NotFoundError, ValidationError } from "../../../../packages/core/src/errors";
import type { LearningItemIssueReport, WordInsightUsageRepo } from "../ports/usage-repo";

const MIN_REPORT_MESSAGE_LENGTH = 8;
const MAX_REPORT_MESSAGE_LENGTH = 1_000;

function normalizeReportMessage(message: string): string {
  return message.trim();
}

export async function reportLearningItemIssue(
  usageRepo: WordInsightUsageRepo,
  input: {
    userId: string;
    itemId: string;
    message: string;
  },
): Promise<LearningItemIssueReport> {
  const message = normalizeReportMessage(input.message);
  if (message.length < MIN_REPORT_MESSAGE_LENGTH) {
    throw new ValidationError("Report message is too short");
  }
  if (message.length > MAX_REPORT_MESSAGE_LENGTH) {
    throw new ValidationError("Report message is too long");
  }

  const report = await usageRepo.reportLearningItemIssue({
    userId: input.userId,
    itemId: input.itemId,
    message,
  });
  if (!report) {
    throw new NotFoundError("Learning item not found");
  }
  return report;
}
