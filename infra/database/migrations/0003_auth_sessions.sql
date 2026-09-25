CREATE TABLE IF NOT EXISTS auth_sessions (
  id uuid PRIMARY KEY,
  user_id uuid NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  provider text NOT NULL,
  subject text NOT NULL,
  sign_in_provider text NOT NULL,
  email_verified boolean NOT NULL DEFAULT false,
  refresh_token_hash text NOT NULL,
  expires_at timestamptz NOT NULL,
  revoked_at timestamptz,
  last_used_at timestamptz NOT NULL DEFAULT now(),
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS auth_sessions_user_idx
  ON auth_sessions (user_id);

CREATE INDEX IF NOT EXISTS auth_sessions_expires_idx
  ON auth_sessions (expires_at);

CREATE INDEX IF NOT EXISTS auth_sessions_revoked_idx
  ON auth_sessions (revoked_at);
