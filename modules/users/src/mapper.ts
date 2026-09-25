import { Buffer } from "node:buffer";
import { ValidationError } from "../../../packages/core/src/errors";
import type { User } from "./domain/user";
import type { Cursor } from "./ports/user-repo";

export type UserResponse = User;

export function toUserResponse(user: User): UserResponse {
  return { ...user };
}

export function encodeCursor(cursor: Cursor): string {
  return Buffer.from(JSON.stringify(cursor), "utf8").toString("base64");
}

export function decodeCursor(value: string): Cursor {
  try {
    const parsed = JSON.parse(Buffer.from(value, "base64").toString("utf8")) as {
      createdAt?: string;
      id?: string;
    } | null;

    if (!parsed || typeof parsed.createdAt !== "string" || typeof parsed.id !== "string") {
      throw new Error("Invalid cursor");
    }

    return { createdAt: parsed.createdAt, id: parsed.id };
  } catch {
    throw new ValidationError("Invalid cursor");
  }
}
