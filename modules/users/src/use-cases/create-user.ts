import { ValidationError } from "../../../../packages/core/src/errors";
import { newId } from "../../../../packages/core/src/ids";
import { sanitizePlainText } from "../../../../packages/core/src/security/sanitize";
import { normalizeEmail } from "../domain/email";
import type { User } from "../domain/user";
import type { UserRepo } from "../ports/user-repo";

function buildReferralCodeFromUserId(id: string): string {
  return id.replace(/-/g, "").toLowerCase();
}

export async function createUser(
  repo: UserRepo,
  input: { email: string; name: string; referredByUserId?: string },
): Promise<User> {
  const id = newId();
  const nowIso = new Date().toISOString();
  const name = sanitizePlainText(input.name).trim();
  if (!name) throw new ValidationError("Name is required");
  const email = normalizeEmail(input.email);
  return await repo.create({
    id,
    email,
    name,
    referralCode: buildReferralCodeFromUserId(id),
    referredByUserId: input.referredByUserId,
    referredAt: input.referredByUserId ? nowIso : undefined,
  });
}
