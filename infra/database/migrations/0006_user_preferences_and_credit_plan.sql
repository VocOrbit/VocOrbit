CREATE TABLE IF NOT EXISTS user_language_preferences (
  user_id uuid PRIMARY KEY REFERENCES users(id) ON DELETE CASCADE,
  l1_language text NOT NULL DEFAULT 'tr',
  l2_language text NOT NULL DEFAULT 'en',
  updated_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE user_credits
ADD COLUMN IF NOT EXISTS paid_basic_cap integer;

ALTER TABLE user_credits
ADD COLUMN IF NOT EXISTS paid_advanced_cap integer;

ALTER TABLE user_credits
ADD COLUMN IF NOT EXISTS monthly_paid_basic_topup integer;

ALTER TABLE user_credits
ADD COLUMN IF NOT EXISTS monthly_paid_advanced_topup integer;

ALTER TABLE user_credits
ADD COLUMN IF NOT EXISTS next_monthly_topup_at timestamptz;

UPDATE user_credits
SET paid_basic_cap = 200
WHERE paid_basic_cap IS NULL;

UPDATE user_credits
SET paid_advanced_cap = 100
WHERE paid_advanced_cap IS NULL;

UPDATE user_credits
SET monthly_paid_basic_topup = 0
WHERE monthly_paid_basic_topup IS NULL;

UPDATE user_credits
SET monthly_paid_advanced_topup = 0
WHERE monthly_paid_advanced_topup IS NULL;

UPDATE user_credits
SET next_monthly_topup_at = now()
WHERE next_monthly_topup_at IS NULL;

ALTER TABLE user_credits
ALTER COLUMN paid_basic_cap SET DEFAULT 200;

ALTER TABLE user_credits
ALTER COLUMN paid_advanced_cap SET DEFAULT 100;

ALTER TABLE user_credits
ALTER COLUMN monthly_paid_basic_topup SET DEFAULT 0;

ALTER TABLE user_credits
ALTER COLUMN monthly_paid_advanced_topup SET DEFAULT 0;

ALTER TABLE user_credits
ALTER COLUMN next_monthly_topup_at SET DEFAULT now();

ALTER TABLE user_credits
ALTER COLUMN paid_basic_cap SET NOT NULL;

ALTER TABLE user_credits
ALTER COLUMN paid_advanced_cap SET NOT NULL;

ALTER TABLE user_credits
ALTER COLUMN monthly_paid_basic_topup SET NOT NULL;

ALTER TABLE user_credits
ALTER COLUMN monthly_paid_advanced_topup SET NOT NULL;

ALTER TABLE user_credits
ALTER COLUMN next_monthly_topup_at SET NOT NULL;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1
    FROM pg_constraint
    WHERE conname = 'user_credits_paid_basic_cap_non_negative'
  ) THEN
    ALTER TABLE user_credits
    ADD CONSTRAINT user_credits_paid_basic_cap_non_negative
    CHECK (paid_basic_cap >= 0);
  END IF;
END $$;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1
    FROM pg_constraint
    WHERE conname = 'user_credits_paid_advanced_cap_non_negative'
  ) THEN
    ALTER TABLE user_credits
    ADD CONSTRAINT user_credits_paid_advanced_cap_non_negative
    CHECK (paid_advanced_cap >= 0);
  END IF;
END $$;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1
    FROM pg_constraint
    WHERE conname = 'user_credits_monthly_paid_basic_topup_non_negative'
  ) THEN
    ALTER TABLE user_credits
    ADD CONSTRAINT user_credits_monthly_paid_basic_topup_non_negative
    CHECK (monthly_paid_basic_topup >= 0);
  END IF;
END $$;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1
    FROM pg_constraint
    WHERE conname = 'user_credits_monthly_paid_advanced_topup_non_negative'
  ) THEN
    ALTER TABLE user_credits
    ADD CONSTRAINT user_credits_monthly_paid_advanced_topup_non_negative
    CHECK (monthly_paid_advanced_topup >= 0);
  END IF;
END $$;
