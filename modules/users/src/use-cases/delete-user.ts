import { UserNotFoundError } from "../domain/errors";
import type { UserRepo } from "../ports/user-repo";

export async function deleteUser(repo: UserRepo, id: string): Promise<void> {
  const deleted = await repo.delete(id);
  if (!deleted) throw new UserNotFoundError(id);
}
