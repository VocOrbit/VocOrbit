import { loadEnv } from "../../../packages/core/src/config/env";
import { createDb } from "./client";
import { userLanguagePreferences, users } from "./schema";

const env = loadEnv();
const { db, sql } = createDb(env.DATABASE_URL);

const now = new Date();
const sampleUsers = [
  {
    id: crypto.randomUUID(),
    email: "alice@example.com",
    name: "Alice",
    role: "admin",
    createdAt: now,
    updatedAt: now,
  },
  {
    id: crypto.randomUUID(),
    email: "bob@example.com",
    name: "Bob",
    role: "user",
    createdAt: now,
    updatedAt: now,
  },
];

await db.insert(users).values(sampleUsers).onConflictDoNothing({ target: users.email });

await db
  .insert(userLanguagePreferences)
  .values(
    sampleUsers.map((user) => ({
      userId: user.id,
      l1Language: "tr",
      l2Language: "en",
      updatedAt: now,
    })),
  )
  .onConflictDoNothing({ target: userLanguagePreferences.userId });

await sql.end({ timeout: 5 });
console.log("Seed completed");
