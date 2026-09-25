import { normalizeEmail } from "../domain/email";
import type { User } from "../domain/user";
import type { UserRepo } from "../ports/user-repo";

export async function getUserByEmail(repo: UserRepo, email: string): Promise<User | null> {
  return await repo.findByEmail(normalizeEmail(email));
}
