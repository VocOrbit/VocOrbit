import type { Cursor, ListUsersResult, UserRepo } from "../ports/user-repo";

export async function listUsers(
  repo: UserRepo,
  input: { limit: number; cursor?: Cursor },
): Promise<ListUsersResult> {
  return repo.list(input);
}
