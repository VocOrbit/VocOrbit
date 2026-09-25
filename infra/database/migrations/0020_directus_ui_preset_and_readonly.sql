DO $$
DECLARE
  admin_role_id uuid;
BEGIN
  IF to_regclass('public.directus_collections') IS NULL THEN
    RETURN;
  END IF;

  SELECT id
  INTO admin_role_id
  FROM directus_roles
  WHERE name = 'Administrator'
  LIMIT 1;

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
    ('accounts', 'manage_accounts', 'Users and profile-related settings', false, false, 'all', 1, 'open'),
    ('announcements', 'campaign', 'Announcement lifecycle and rewards', false, false, 'all', 2, 'open'),
    ('vocabulary', 'school', 'Word insight and learning data', false, false, 'all', 3, 'open'),
    ('practice', 'sports_esports', 'Practice sessions and answers', false, false, 'all', 4, 'open'),
    ('billing', 'payments', 'Purchases and credit operations', false, false, 'all', 5, 'open')
  ON CONFLICT (collection) DO UPDATE SET
    icon = EXCLUDED.icon,
    note = EXCLUDED.note,
    hidden = EXCLUDED.hidden,
    singleton = EXCLUDED.singleton,
    accountability = EXCLUDED.accountability,
    sort = EXCLUDED.sort,
    collapse = EXCLUDED.collapse;

  UPDATE directus_collections
  SET "group" = 'accounts',
      sort = CASE collection
        WHEN 'users' THEN 1
        WHEN 'user_language_preferences' THEN 2
        WHEN 'user_credits' THEN 3
        ELSE sort
      END
  WHERE collection IN ('users', 'user_language_preferences', 'user_credits');

  UPDATE directus_collections
  SET "group" = 'announcements',
      sort = CASE collection
        WHEN 'app_announcements' THEN 1
        WHEN 'app_announcement_reads' THEN 2
        WHEN 'app_announcement_reward_claims' THEN 3
        ELSE sort
      END
  WHERE collection IN ('app_announcements', 'app_announcement_reads', 'app_announcement_reward_claims');

  UPDATE directus_collections
  SET "group" = 'vocabulary',
      sort = CASE collection
        WHEN 'learning_items' THEN 1
        WHEN 'lookups' THEN 2
        WHEN 'word_insight_jobs' THEN 3
        ELSE sort
      END
  WHERE collection IN ('learning_items', 'lookups', 'word_insight_jobs');

  UPDATE directus_collections
  SET "group" = 'practice',
      sort = CASE collection
        WHEN 'exercise_sessions' THEN 1
        WHEN 'exercise_questions' THEN 2
        WHEN 'exercise_answers' THEN 3
        ELSE sort
      END
  WHERE collection IN ('exercise_sessions', 'exercise_questions', 'exercise_answers');

  UPDATE directus_collections
  SET "group" = 'billing',
      sort = CASE collection
        WHEN 'purchases' THEN 1
        WHEN 'billing_events' THEN 2
        WHEN 'billing_credit_cycles' THEN 3
        WHEN 'credit_ledger' THEN 4
        ELSE sort
      END
  WHERE collection IN ('purchases', 'billing_events', 'billing_credit_cycles', 'credit_ledger');

  DELETE FROM directus_collections
  WHERE collection IN ('grp_accounts', 'grp_announcements', 'grp_vocabulary', 'grp_practice', 'grp_billing');

  UPDATE directus_collections SET display_template = '{{email}}' WHERE collection = 'users';
  UPDATE directus_collections SET display_template = '{{title}}' WHERE collection = 'app_announcements';
  UPDATE directus_collections SET display_template = '{{vocab}} - {{target_meaning}}' WHERE collection = 'learning_items';
  UPDATE directus_collections SET display_template = '{{vocab}} - {{mode}}' WHERE collection = 'lookups';
  UPDATE directus_collections SET display_template = '{{store}} - {{sku}}' WHERE collection = 'purchases';
  UPDATE directus_collections SET display_template = '{{credit_type}} {{amount}}' WHERE collection = 'credit_ledger';

  INSERT INTO directus_fields (collection, field)
  SELECT cols.table_name, cols.column_name
  FROM information_schema.columns cols
  WHERE cols.table_schema = 'public'
    AND cols.table_name IN (
      'users',
      'user_language_preferences',
      'user_credits',
      'app_announcements',
      'app_announcement_reads',
      'app_announcement_reward_claims',
      'learning_items',
      'lookups',
      'word_insight_jobs',
      'exercise_sessions',
      'exercise_questions',
      'exercise_answers',
      'purchases',
      'billing_events',
      'billing_credit_cycles',
      'credit_ledger'
    )
    AND NOT EXISTS (
      SELECT 1
      FROM directus_fields f
      WHERE f.collection = cols.table_name
        AND f.field = cols.column_name
    );

  UPDATE directus_fields
  SET readonly = true
  WHERE collection IN (
      'users',
      'user_language_preferences',
      'user_credits',
      'app_announcements',
      'app_announcement_reads',
      'app_announcement_reward_claims',
      'learning_items',
      'lookups',
      'word_insight_jobs',
      'exercise_sessions',
      'exercise_questions',
      'exercise_answers',
      'purchases',
      'billing_events',
      'billing_credit_cycles',
      'credit_ledger'
    )
    AND field IN (
      'id',
      'user_id',
      'announcement_id',
      'session_id',
      'question_id',
      'item_id',
      'latest_lookup_id',
      'request_id',
      'event_id',
      'purchase_token',
      'created_at',
      'updated_at',
      'last_lookup_at',
      'favorited_at',
      'learned_at',
      'read_at',
      'claimed_at',
      'started_at',
      'finished_at',
      'completed_at',
      'starts_at',
      'expires_at',
      'next_monthly_topup_at',
      'raw_payload',
      'response_payload',
      'input_payload',
      'context_payload',
      'result_payload',
      'raw_claims',
      'auth_data',
      'token',
      'refresh_token_hash',
      'last_event_id'
    );

  UPDATE directus_fields
  SET hidden = true
  WHERE collection IN ('lookups', 'word_insight_jobs', 'billing_events', 'purchases')
    AND field IN ('raw_payload', 'response_payload', 'input_payload', 'context_payload', 'result_payload');

  UPDATE directus_fields
  SET hidden = true
  WHERE collection IN ('auth_identities', 'auth_sessions')
    AND field IN ('raw_claims', 'auth_data', 'token', 'refresh_token_hash');

  UPDATE directus_fields
  SET sort = CASE collection
      WHEN 'users' THEN CASE field
        WHEN 'email' THEN 1
        WHEN 'name' THEN 2
        WHEN 'role' THEN 3
        WHEN 'created_at' THEN 4
        WHEN 'updated_at' THEN 5
        WHEN 'id' THEN 99
        ELSE sort
      END
      WHEN 'app_announcements' THEN CASE field
        WHEN 'title' THEN 1
        WHEN 'level' THEN 2
        WHEN 'body' THEN 3
        WHEN 'is_active' THEN 4
        WHEN 'starts_at' THEN 5
        WHEN 'ends_at' THEN 6
        WHEN 'reward_credit_type' THEN 7
        WHEN 'reward_amount' THEN 8
        WHEN 'created_at' THEN 9
        WHEN 'id' THEN 99
        ELSE sort
      END
      WHEN 'learning_items' THEN CASE field
        WHEN 'vocab' THEN 1
        WHEN 'target_meaning' THEN 2
        WHEN 'definition_l2' THEN 3
        WHEN 'phonetic' THEN 4
        WHEN 'status' THEN 5
        WHEN 'is_favorite' THEN 6
        WHEN 'encounter_count' THEN 7
        WHEN 'last_lookup_at' THEN 8
        WHEN 'user_id' THEN 98
        WHEN 'id' THEN 99
        ELSE sort
      END
      ELSE sort
    END
  WHERE collection IN ('users', 'app_announcements', 'learning_items');

  IF admin_role_id IS NOT NULL THEN
    DELETE FROM directus_presets
    WHERE role IS NULL
      AND "user" IS NOT NULL
      AND bookmark IS NULL
      AND collection IN (
        'users',
        'user_language_preferences',
        'user_credits',
        'app_announcements',
        'learning_items',
        'lookups',
        'word_insight_jobs',
        'exercise_sessions',
        'purchases',
        'billing_events',
        'credit_ledger'
      );

    DELETE FROM directus_presets
    WHERE role = admin_role_id
      AND "user" IS NULL
      AND bookmark IS NULL
      AND collection IN (
        'users',
        'user_language_preferences',
        'user_credits',
        'app_announcements',
        'learning_items',
        'lookups',
        'word_insight_jobs',
        'exercise_sessions',
        'purchases',
        'billing_events',
        'credit_ledger'
      );

    INSERT INTO directus_presets (role, collection, layout, layout_query, layout_options)
    VALUES
      (
        admin_role_id,
        'users',
        'tabular',
        '{"tabular":{"fields":["email","name","role","created_at","updated_at","id"],"sort":["-created_at"],"page":1}}'::json,
        '{"tabular":{"dense":false}}'::json
      ),
      (
        admin_role_id,
        'user_language_preferences',
        'tabular',
        '{"tabular":{"fields":["user_id","l1_language","l2_language","updated_at"],"sort":["-updated_at"],"page":1}}'::json,
        '{"tabular":{"dense":false}}'::json
      ),
      (
        admin_role_id,
        'user_credits',
        'tabular',
        '{"tabular":{"fields":["user_id","free_basic","free_advanced","paid_basic","paid_advanced","updated_at"],"sort":["-updated_at"],"page":1}}'::json,
        '{"tabular":{"dense":false}}'::json
      ),
      (
        admin_role_id,
        'app_announcements',
        'tabular',
        '{"tabular":{"fields":["title","level","is_active","starts_at","ends_at","reward_credit_type","reward_amount","created_at"],"sort":["-created_at"],"page":1}}'::json,
        '{"tabular":{"dense":false}}'::json
      ),
      (
        admin_role_id,
        'learning_items',
        'tabular',
        '{"tabular":{"fields":["vocab","target_meaning","status","is_favorite","encounter_count","last_lookup_at","user_id","id"],"sort":["-last_lookup_at"],"page":1}}'::json,
        '{"tabular":{"dense":false}}'::json
      ),
      (
        admin_role_id,
        'lookups',
        'tabular',
        '{"tabular":{"fields":["created_at","vocab","mode","source_lang","target_lang","ai_provider","latency_ms","user_id","id"],"sort":["-created_at"],"page":1}}'::json,
        '{"tabular":{"dense":false}}'::json
      ),
      (
        admin_role_id,
        'word_insight_jobs',
        'tabular',
        '{"tabular":{"fields":["created_at","status","request_id","started_at","finished_at","error_code","user_id","id"],"sort":["-created_at"],"page":1}}'::json,
        '{"tabular":{"dense":false}}'::json
      ),
      (
        admin_role_id,
        'exercise_sessions',
        'tabular',
        '{"tabular":{"fields":["created_at","mode","status","total_questions","completed_at","user_id","id"],"sort":["-created_at"],"page":1}}'::json,
        '{"tabular":{"dense":false}}'::json
      ),
      (
        admin_role_id,
        'purchases',
        'tabular',
        '{"tabular":{"fields":["user_id","store","sku","status","starts_at","expires_at","id"],"sort":["-updated_at"],"page":1}}'::json,
        '{"tabular":{"dense":false}}'::json
      ),
      (
        admin_role_id,
        'billing_events',
        'tabular',
        '{"tabular":{"fields":["created_at","store","event_id","status","purchase_token","user_id","id"],"sort":["-created_at"],"page":1}}'::json,
        '{"tabular":{"dense":false}}'::json
      ),
      (
        admin_role_id,
        'credit_ledger',
        'tabular',
        '{"tabular":{"fields":["created_at","user_id","credit_type","amount","reason","mode","request_id","id"],"sort":["-created_at"],"page":1}}'::json,
        '{"tabular":{"dense":false}}'::json
      );
  END IF;
END $$;
