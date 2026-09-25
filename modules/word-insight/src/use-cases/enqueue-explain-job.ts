import { UnauthorizedError } from "../../../../packages/core/src/errors";
import { newId } from "../../../../packages/core/src/ids";
import type { ExplainJobRecord, WordInsightExplainJobRepo } from "../ports/explain-job-repo";
import type { ExplainWordContext, ExplainWordInput } from "./explain-word";
import { parseExplainWordInput } from "./explain-word-input";

type EnqueueExplainJobDeps = {
  jobs: WordInsightExplainJobRepo;
  defaults: {
    maxSentenceChars: number;
    maxSelectedWordChars: number;
  };
};

export async function enqueueExplainJob(
  deps: EnqueueExplainJobDeps,
  input: ExplainWordInput,
  context: ExplainWordContext,
): Promise<ExplainJobRecord> {
  if (context.user.id === "anonymous") {
    throw new UnauthorizedError("Authenticated user is required");
  }

  // Keep fast-fail validation at enqueue time so invalid payloads are not queued.
  const parsedInput = parseExplainWordInput(input, {
    maxSentenceChars: deps.defaults.maxSentenceChars,
    maxSelectedWordChars: deps.defaults.maxSelectedWordChars,
  });

  return await deps.jobs.enqueue({
    input: {
      ...input,
      mode: parsedInput.mode,
      sentence: parsedInput.sentence,
      selectedWord: parsedInput.selectedWord,
    },
    context: {
      requestId: context.requestId ?? newId(),
      preferredTargetLang: context.preferredTargetLang,
      user: context.user,
    },
  });
}
