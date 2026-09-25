CREATE TABLE IF NOT EXISTS user_credits (
  user_id uuid PRIMARY KEY REFERENCES users(id) ON DELETE CASCADE,
  free_basic integer NOT NULL DEFAULT 10,
  free_advanced integer NOT NULL DEFAULT 3,
  paid_basic integer NOT NULL DEFAULT 0,
  paid_advanced integer NOT NULL DEFAULT 0,
  updated_at timestamptz NOT NULL DEFAULT now(),
  CHECK (free_basic >= 0),
  CHECK (free_advanced >= 0),
  CHECK (paid_basic >= 0),
  CHECK (paid_advanced >= 0)
);

CREATE TABLE IF NOT EXISTS credit_ledger (
  id uuid PRIMARY KEY,
  user_id uuid NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  reason text NOT NULL,
  credit_type text NOT NULL,
  amount integer NOT NULL,
  mode text NOT NULL,
  request_id text,
  created_at timestamptz NOT NULL DEFAULT now(),
  CHECK (credit_type IN ('basic', 'advanced')),
  CHECK (mode IN ('free', 'paid'))
);

CREATE INDEX IF NOT EXISTS credit_ledger_user_idx
  ON credit_ledger (user_id);

CREATE INDEX IF NOT EXISTS credit_ledger_request_idx
  ON credit_ledger (request_id);

CREATE TABLE IF NOT EXISTS lookups (
  id uuid PRIMARY KEY,
  user_id uuid NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  request_id text NOT NULL,
  mode text NOT NULL,
  vocab text NOT NULL,
  sentence text NOT NULL,
  source_lang text NOT NULL,
  target_lang text NOT NULL,
  ai_provider text NOT NULL,
  ai_model text NOT NULL,
  response_summary jsonb,
  latency_ms integer NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  CHECK (mode IN ('basic', 'advanced')),
  CHECK (latency_ms >= 0)
);

CREATE INDEX IF NOT EXISTS lookups_user_idx
  ON lookups (user_id);

CREATE UNIQUE INDEX IF NOT EXISTS lookups_user_request_uidx
  ON lookups (user_id, request_id);

CREATE INDEX IF NOT EXISTS lookups_created_at_idx
  ON lookups (created_at);
