import { UserNotFoundError } from "../domain/errors";
import type { UserLanguagePreferences } from "../domain/language-preferences";
import { normalizeLanguageTag } from "../domain/language-preferences";
import type { UserRepo } from "../ports/user-repo";

export async function setLanguagePreferences(
  repo: UserRepo,
  input: {
    userId: string;
    l1Language: string;
    l2Language: string;
  },
): Promise<UserLanguagePreferences> {
  const l1Language = normalizeLanguageTag(input.l1Language, "l1Language");
  const l2Language = normalizeLanguageTag(input.l2Language, "l2Language");

  const preferences = await repo.upsertLanguagePreferences({
    userId: input.userId,
    l1Language,
    l2Language,
  });
  if (!preferences) {
    throw new UserNotFoundError(input.userId);
  }
  return preferences;
}
