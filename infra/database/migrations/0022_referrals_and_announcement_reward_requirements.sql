ALTER TABLE users
  ADD COLUMN IF NOT EXISTS referral_code text;

UPDATE users
SET referral_code = lower(replace(id::text, '-', ''))
WHERE referral_code IS NULL;

ALTER TABLE users
  ALTER COLUMN referral_code SET NOT NULL;

CREATE UNIQUE INDEX IF NOT EXISTS users_referral_code_uidx
  ON users (referral_code);

ALTER TABLE users
  ADD COLUMN IF NOT EXISTS referred_by_user_id uuid;

ALTER TABLE users
  ADD COLUMN IF NOT EXISTS referred_at timestamptz;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1
    FROM pg_constraint
    WHERE conname = 'users_referred_by_fk'
  ) THEN
    ALTER TABLE users
      ADD CONSTRAINT users_referred_by_fk
      FOREIGN KEY (referred_by_user_id)
      REFERENCES users (id)
      ON DELETE SET NULL;
  END IF;
END $$;

CREATE INDEX IF NOT EXISTS users_referred_by_idx
  ON users (referred_by_user_id, referred_at DESC);

ALTER TABLE app_announcements
  ADD COLUMN IF NOT EXISTS reward_requirement_type text;

ALTER TABLE app_announcements
  ADD COLUMN IF NOT EXISTS reward_requirement_count integer;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1
    FROM pg_constraint
    WHERE conname = 'app_announcements_reward_requirement_type_check'
  ) THEN
    ALTER TABLE app_announcements
      ADD CONSTRAINT app_announcements_reward_requirement_type_check
      CHECK (
        reward_requirement_type IS NULL OR reward_requirement_type IN ('referral_signup')
      );
  END IF;
END $$;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1
    FROM pg_constraint
    WHERE conname = 'app_announcements_reward_requirement_count_check'
  ) THEN
    ALTER TABLE app_announcements
      ADD CONSTRAINT app_announcements_reward_requirement_count_check
      CHECK (
        reward_requirement_count IS NULL OR reward_requirement_count > 0
      );
  END IF;
END $$;
