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
    sort,
    collapse
  )
  VALUES
    ('grp_accounts', 'manage_accounts', 'Users, language preferences, and credits', false, false, 'all', 1, 'open'),
    ('grp_announcements', 'campaign', 'Announcement lifecycle and rewards', false, false, 'all', 2, 'open'),
    ('grp_vocabulary', 'school', 'Word insight and learning items', false, false, 'all', 3, 'open'),
    ('grp_practice', 'sports_esports', 'Practice sessions, questions, and answers', false, false, 'all', 4, 'open'),
    ('grp_billing', 'payments', 'Purchases, billing events, and credit ledger', false, false, 'all', 5, 'open')
  ON CONFLICT (collection) DO UPDATE SET
    icon = EXCLUDED.icon,
    note = EXCLUDED.note,
    hidden = EXCLUDED.hidden,
    singleton = EXCLUDED.singleton,
    accountability = EXCLUDED.accountability,
    sort = EXCLUDED.sort,
    collapse = EXCLUDED.collapse;

  UPDATE directus_collections
  SET "group" = 'grp_accounts',
      sort = CASE collection
        WHEN 'users' THEN 1
        WHEN 'user_language_preferences' THEN 2
        WHEN 'user_credits' THEN 3
        ELSE sort
      END
  WHERE collection IN ('users', 'user_language_preferences', 'user_credits');

  UPDATE directus_collections
  SET "group" = 'grp_announcements',
      sort = CASE collection
        WHEN 'app_announcements' THEN 1
        WHEN 'app_announcement_reads' THEN 2
        WHEN 'app_announcement_reward_claims' THEN 3
        ELSE sort
      END
  WHERE collection IN ('app_announcements', 'app_announcement_reads', 'app_announcement_reward_claims');

  UPDATE directus_collections
  SET "group" = 'grp_vocabulary',
      sort = CASE collection
        WHEN 'learning_items' THEN 1
        WHEN 'lookups' THEN 2
        WHEN 'word_insight_jobs' THEN 3
        ELSE sort
      END
  WHERE collection IN ('learning_items', 'lookups', 'word_insight_jobs');

  UPDATE directus_collections
  SET "group" = 'grp_practice',
      sort = CASE collection
        WHEN 'exercise_sessions' THEN 1
        WHEN 'exercise_questions' THEN 2
        WHEN 'exercise_answers' THEN 3
        ELSE sort
      END
  WHERE collection IN ('exercise_sessions', 'exercise_questions', 'exercise_answers');

  UPDATE directus_collections
  SET "group" = 'grp_billing',
      sort = CASE collection
        WHEN 'purchases' THEN 1
        WHEN 'billing_events' THEN 2
        WHEN 'billing_credit_cycles' THEN 3
        WHEN 'credit_ledger' THEN 4
        ELSE sort
      END
  WHERE collection IN ('purchases', 'billing_events', 'billing_credit_cycles', 'credit_ledger');
END $$;
