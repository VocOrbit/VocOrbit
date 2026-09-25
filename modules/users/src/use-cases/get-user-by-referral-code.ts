import type { User } from "../domain/user";
import type { UserRepo } from "../ports/user-repo";

function normalizeReferralCode(value: string): string {
  return value
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]/g, "");
}

export async function getUserByReferralCode(
  repo: UserRepo,
  referralCode: string,
): Promise<User | null> {
  const normalized = normalizeReferralCode(referralCode);
  if (!normalized) {
    return null;
  }
  return await repo.findByReferralCode(normalized);
}
