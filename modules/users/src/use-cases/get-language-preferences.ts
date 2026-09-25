import { UserNotFoundError } from "../domain/errors";
import { type UserLanguagePreferences, normalizeLanguageTag } from "../domain/language-preferences";
import type { UserRepo } from "../ports/user-repo";

export async function getLanguagePreferences(
  repo: UserRepo,
  userId: string,
): Promise<UserLanguagePreferences> {
  const preferences = await repo.getLanguagePreferences(userId);
  if (!preferences) {
    throw new UserNotFoundError(userId);
  }
  return {
    ...preferences,
    l1Language: normalizeLanguageTag(preferences.l1Language, "l1Language"),
    l2Language: normalizeLanguageTag(preferences.l2Language, "l2Language"),
  };
}
