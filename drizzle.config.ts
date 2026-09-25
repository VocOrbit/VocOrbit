import type { Config } from "drizzle-kit";

export default {
  schema: "./infra/database/src/schema.ts",
  out: "./infra/database/migrations",
  dialect: "postgresql",
  dbCredentials: {
    url: process.env.DATABASE_URL || "",
  },
} satisfies Config;
