import { UserNotFoundError } from "../domain/errors";
import type { User } from "../domain/user";
import type { UserRepo } from "../ports/user-repo";

export async function getUser(repo: UserRepo, id: string): Promise<User> {
  const user = await repo.findById(id);
  if (!user) throw new UserNotFoundError(id);
  return user;
}
