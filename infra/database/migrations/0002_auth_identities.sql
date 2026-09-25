CREATE TABLE IF NOT EXISTS auth_identities (
  id uuid PRIMARY KEY,
  provider text NOT NULL,
  subject text NOT NULL,
  user_id uuid NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  email text NOT NULL,
  email_verified boolean NOT NULL DEFAULT false,
  sign_in_provider text NOT NULL,
  raw_claims jsonb NOT NULL,
  last_sign_in_at timestamptz NOT NULL DEFAULT now(),
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE UNIQUE INDEX IF NOT EXISTS auth_identities_provider_subject_uidx
  ON auth_identities (provider, subject);

CREATE UNIQUE INDEX IF NOT EXISTS auth_identities_user_provider_uidx
  ON auth_identities (user_id, provider);

CREATE INDEX IF NOT EXISTS auth_identities_user_idx
  ON auth_identities (user_id);
