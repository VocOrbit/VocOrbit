import type { UserLanguagePreferences } from "../domain/language-preferences";
import type { User } from "../domain/user";

export type Cursor = { createdAt: string; id: string };

export type ListUsersResult = {
  items: User[];
  nextCursor?: Cursor;
};

export type CreateUserInput = {
  id: string;
  email: string;
  name: string;
  referralCode: string;
  referredByUserId?: string;
  referredAt?: string;
};

export type UpdateUserInput = {
  email?: string;
  name?: string;
};

export interface UserRepo {
  create(input: CreateUserInput): Promise<User>;
  findById(id: string): Promise<User | null>;
  findByEmail(email: string): Promise<User | null>;
  findByReferralCode(referralCode: string): Promise<User | null>;
  getLanguagePreferences(userId: string): Promise<UserLanguagePreferences | null>;
  upsertLanguagePreferences(input: {
    userId: string;
    l1Language: string;
    l2Language: string;
  }): Promise<UserLanguagePreferences | null>;
  list(input: { limit: number; cursor?: Cursor }): Promise<ListUsersResult>;
  update(id: string, input: UpdateUserInput): Promise<User | null>;
  delete(id: string): Promise<boolean>;
}
