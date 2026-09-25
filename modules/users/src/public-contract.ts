import type { UserLanguagePreferences } from "./domain/language-preferences";
import type { User } from "./domain/user";
import type { Cursor, ListUsersResult, UserRepo } from "./ports/user-repo";
import { createUser } from "./use-cases/create-user";
import { deleteUser } from "./use-cases/delete-user";
import { getLanguagePreferences } from "./use-cases/get-language-preferences";
import { getUser } from "./use-cases/get-user";
import { getUserByEmail } from "./use-cases/get-user-by-email";
import { getUserByReferralCode } from "./use-cases/get-user-by-referral-code";
import { listUsers } from "./use-cases/list-users";
import { setLanguagePreferences } from "./use-cases/set-language-preferences";
import { updateUser } from "./use-cases/update-user";

export type CreateUserPublicInput = {
  email: string;
  name: string;
  referredByUserId?: string;
};

export type UpdateUserPublicInput = {
  id: string;
  email?: string;
  name?: string;
};

export type ListUsersPublicInput = {
  limit: number;
  cursor?: Cursor;
};

export interface UsersPublicContract {
  createUser(input: CreateUserPublicInput): Promise<User>;
  getUser(id: string): Promise<User>;
  getUserByEmail(email: string): Promise<User | null>;
  getUserByReferralCode(referralCode: string): Promise<User | null>;
  getLanguagePreferences(userId: string): Promise<UserLanguagePreferences>;
  setLanguagePreferences(input: {
    userId: string;
    l1Language: string;
    l2Language: string;
  }): Promise<UserLanguagePreferences>;
  listUsers(input: ListUsersPublicInput): Promise<ListUsersResult>;
  updateUser(input: UpdateUserPublicInput): Promise<User>;
  deleteUser(id: string): Promise<void>;
}

export function createUsersPublicContract(repo: UserRepo): UsersPublicContract {
  return {
    createUser(input) {
      return createUser(repo, input);
    },
    getUser(id) {
      return getUser(repo, id);
    },
    getUserByEmail(email) {
      return getUserByEmail(repo, email);
    },
    getUserByReferralCode(referralCode) {
      return getUserByReferralCode(repo, referralCode);
    },
    getLanguagePreferences(userId) {
      return getLanguagePreferences(repo, userId);
    },
    setLanguagePreferences(input) {
      return setLanguagePreferences(repo, input);
    },
    listUsers(input) {
      return listUsers(repo, input);
    },
    updateUser(input) {
      return updateUser(repo, input);
    },
    deleteUser(id) {
      return deleteUser(repo, id);
    },
  };
}
