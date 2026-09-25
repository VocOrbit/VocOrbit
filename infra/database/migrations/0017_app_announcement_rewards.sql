ALTER TABLE app_announcements
  ADD COLUMN IF NOT EXISTS reward_credit_type text,
  ADD COLUMN IF NOT EXISTS reward_amount integer;

CREATE TABLE IF NOT EXISTS app_announcement_reward_claims (
  user_id uuid NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  announcement_id uuid NOT NULL REFERENCES app_announcements(id) ON DELETE CASCADE,
  credit_type text NOT NULL,
  amount integer NOT NULL,
  claimed_at timestamptz NOT NULL DEFAULT now(),
  PRIMARY KEY (user_id, announcement_id)
);

CREATE INDEX IF NOT EXISTS app_announcement_reward_claims_user_claimed_idx
  ON app_announcement_reward_claims (user_id, claimed_at DESC);

CREATE INDEX IF NOT EXISTS app_announcement_reward_claims_announcement_idx
  ON app_announcement_reward_claims (announcement_id);
