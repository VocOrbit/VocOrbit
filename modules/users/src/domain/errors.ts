import { NotFoundError } from "../../../../packages/core/src/errors";

export class UserNotFoundError extends NotFoundError {
  constructor(id?: string) {
    super(id ? `User not found: ${id}` : "User not found");
  }
}
