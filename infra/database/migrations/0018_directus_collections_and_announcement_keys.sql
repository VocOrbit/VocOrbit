ALTER TABLE app_announcement_reads
  ADD COLUMN IF NOT EXISTS id uuid;

UPDATE app_announcement_reads
SET id = gen_random_uuid()
WHERE id IS NULL;

ALTER TABLE app_announcement_reads
  ALTER COLUMN id SET DEFAULT gen_random_uuid(),
  ALTER COLUMN id SET NOT NULL;

ALTER TABLE app_announcement_reads
  DROP CONSTRAINT IF EXISTS app_announcement_reads_pkey;

ALTER TABLE app_announcement_reads
  ADD CONSTRAINT app_announcement_reads_pkey PRIMARY KEY (id);

CREATE UNIQUE INDEX IF NOT EXISTS app_announcement_reads_user_announcement_uidx
  ON app_announcement_reads (user_id, announcement_id);

ALTER TABLE app_announcement_reward_claims
  ADD COLUMN IF NOT EXISTS id uuid;

UPDATE app_announcement_reward_claims
SET id = gen_random_uuid()
WHERE id IS NULL;

ALTER TABLE app_announcement_reward_claims
  ALTER COLUMN id SET DEFAULT gen_random_uuid(),
  ALTER COLUMN id SET NOT NULL;

ALTER TABLE app_announcement_reward_claims
  DROP CONSTRAINT IF EXISTS app_announcement_reward_claims_pkey;

ALTER TABLE app_announcement_reward_claims
  ADD CONSTRAINT app_announcement_reward_claims_pkey PRIMARY KEY (id);

CREATE UNIQUE INDEX IF NOT EXISTS app_announcement_reward_claims_user_announcement_uidx
  ON app_announcement_reward_claims (user_id, announcement_id);

DO $$
BEGIN
  IF to_regclass('public.directus_collections') IS NULL THEN
    RETURN;
  END IF;

  INSERT INTO directus_collections (
    collection,
    icon,
    note,
    hidden,
    singleton,
    accountability,
    sort
  )
  VALUES
    ('users', 'person', 'App users', false, false, 'all', 1),
    ('user_language_preferences', 'translate', 'User language preferences', false, false, 'all', 2),
    ('user_credits', 'savings', 'Current credit balances', false, false, 'all', 3),
    ('app_announcements', 'campaign', 'In-app announcements', false, false, 'all', 4),
    ('app_announcement_reads', 'mark_email_read', 'Announcement read events', false, false, 'all', 5),
    ('app_announcement_reward_claims', 'redeem', 'Announcement reward claims', false, false, 'all', 6),
    ('learning_items', 'school', 'Vocabulary learning items', false, false, 'all', 7),
    ('lookups', 'search', 'Word insight lookups', false, false, 'all', 8),
    ('word_insight_jobs', 'psychology', 'Async word insight jobs', false, false, 'all', 9),
    ('exercise_sessions', 'sports_esports', 'Exercise sessions', false, false, 'all', 10),
    ('exercise_questions', 'quiz', 'Exercise questions', false, false, 'all', 11),
    ('exercise_answers', 'task_alt', 'Exercise answers', false, false, 'all', 12),
    ('purchases', 'payments', 'In-app purchases', false, false, 'all', 13),
    ('billing_events', 'receipt_long', 'Store billing events', false, false, 'all', 14),
    ('billing_credit_cycles', 'calendar_month', 'Credited monthly cycles', false, false, 'all', 15),
    ('credit_ledger', 'account_balance_wallet', 'Credit movements ledger', false, false, 'all', 16),
    ('auth_identities', 'badge', 'User auth identities', true, false, 'all', 90),
    ('auth_sessions', 'key', 'User sessions', true, false, 'all', 91),
    ('outbox_events', 'mail', 'Outbox events', true, false, 'all', 92),
    ('schema_migrations', 'build', 'Applied migrations', true, false, 'all', 93)
  ON CONFLICT (collection) DO UPDATE SET
    icon = EXCLUDED.icon,
    note = EXCLUDED.note,
    hidden = EXCLUDED.hidden,
    singleton = EXCLUDED.singleton,
    accountability = EXCLUDED.accountability,
    sort = EXCLUDED.sort;
END $$;
