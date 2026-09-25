export type UserRole = "user" | "admin";

export type User = {
  id: string;
  email: string;
  name: string;
  role: UserRole;
  homeRegion?: string;
  shardId?: number;
  referralCode?: string;
  createdAt: string;
  updatedAt: string;
};
