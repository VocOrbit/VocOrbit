import { ValidationError } from "../../../../packages/core/src/errors";
import { sanitizePlainText } from "../../../../packages/core/src/security/sanitize";
import { normalizeEmail } from "../domain/email";
import { UserNotFoundError } from "../domain/errors";
import type { User } from "../domain/user";
import type { UserRepo } from "../ports/user-repo";

export async function updateUser(
  repo: UserRepo,
  input: { id: string; email?: string; name?: string },
): Promise<User> {
  if (input.email === undefined && input.name === undefined) {
    throw new ValidationError("At least one field must be provided");
  }

  const email = input.email !== undefined ? normalizeEmail(input.email) : undefined;
  const name = input.name !== undefined ? sanitizePlainText(input.name).trim() : undefined;

  if (input.name !== undefined && !name) throw new ValidationError("Name is required");

  const user = await repo.update(input.id, { email, name });
  if (!user) throw new UserNotFoundError(input.id);
  return user;
}
