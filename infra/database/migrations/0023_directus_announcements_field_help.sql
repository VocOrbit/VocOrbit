DO $$
DECLARE
  admin_role_id uuid;
BEGIN
  IF to_regclass('public.directus_fields') IS NULL THEN
    RETURN;
  END IF;

  SELECT id
  INTO admin_role_id
  FROM directus_roles
  WHERE name = 'Administrator'
  LIMIT 1;

  INSERT INTO directus_fields (collection, field)
  SELECT cols.table_name, cols.column_name
  FROM information_schema.columns cols
  WHERE cols.table_schema = 'public'
    AND (
      (cols.table_name = 'users' AND cols.column_name IN ('referral_code', 'referred_by_user_id', 'referred_at'))
      OR (
        cols.table_name = 'app_announcements'
        AND cols.column_name IN ('reward_requirement_type', 'reward_requirement_count')
      )
    )
    AND NOT EXISTS (
      SELECT 1
      FROM directus_fields f
      WHERE f.collection = cols.table_name
        AND f.field = cols.column_name
    );

  UPDATE directus_collections
  SET note = 'In-app announcements, CTA links, and referral reward campaigns'
  WHERE collection = 'app_announcements';

  UPDATE directus_fields
  SET readonly = true,
      note = CASE field
        WHEN 'referral_code' THEN 'System generated code for referral invites.'
        WHEN 'referred_by_user_id' THEN 'Set automatically when user signs up with a valid referral code.'
        WHEN 'referred_at' THEN 'Timestamp of referral attribution.'
        ELSE note
      END,
      sort = CASE field
        WHEN 'referral_code' THEN 4
        WHEN 'referred_by_user_id' THEN 5
        WHEN 'referred_at' THEN 6
        ELSE sort
      END
  WHERE collection = 'users'
    AND field IN ('referral_code', 'referred_by_user_id', 'referred_at');

  UPDATE directus_fields
  SET sort = CASE field
        WHEN 'title' THEN 1
        WHEN 'level' THEN 2
        WHEN 'body' THEN 3
        WHEN 'cta_label' THEN 4
        WHEN 'cta_url' THEN 5
        WHEN 'deep_link' THEN 6
        WHEN 'is_active' THEN 7
        WHEN 'starts_at' THEN 8
        WHEN 'ends_at' THEN 9
        WHEN 'reward_credit_type' THEN 10
        WHEN 'reward_amount' THEN 11
        WHEN 'reward_requirement_type' THEN 12
        WHEN 'reward_requirement_count' THEN 13
        WHEN 'updated_at' THEN 14
        WHEN 'created_at' THEN 15
        WHEN 'id' THEN 99
        ELSE sort
      END,
      width = CASE field
        WHEN 'title' THEN 'full'
        WHEN 'body' THEN 'full'
        WHEN 'cta_label' THEN 'half'
        WHEN 'cta_url' THEN 'half'
        WHEN 'deep_link' THEN 'half'
        WHEN 'level' THEN 'half'
        WHEN 'is_active' THEN 'half'
        WHEN 'starts_at' THEN 'half'
        WHEN 'ends_at' THEN 'half'
        WHEN 'reward_credit_type' THEN 'half'
        WHEN 'reward_amount' THEN 'half'
        WHEN 'reward_requirement_type' THEN 'half'
        WHEN 'reward_requirement_count' THEN 'half'
        ELSE width
      END,
      note = CASE field
        WHEN 'body' THEN 'Plain text content shown in app detail. For external links use cta_url or deep_link.'
        WHEN 'cta_label' THEN 'Button label in announcement detail (example: View offer).'
        WHEN 'cta_url' THEN 'External web URL. If deep_link also exists, app prefers deep_link first.'
        WHEN 'deep_link' THEN 'App deep link (example: vocorbit://settings/iap).'
        WHEN 'reward_credit_type' THEN 'Reward credit type when user claims: basic or advanced.'
        WHEN 'reward_amount' THEN 'Reward amount (positive integer).'
        WHEN 'reward_requirement_type' THEN 'Optional condition before claim. Use referral_signup for invite campaigns.'
        WHEN 'reward_requirement_count' THEN 'How many successful referrals are required before claim is allowed.'
        ELSE note
      END
  WHERE collection = 'app_announcements'
    AND field IN (
      'title',
      'level',
      'body',
      'cta_label',
      'cta_url',
      'deep_link',
      'is_active',
      'starts_at',
      'ends_at',
      'reward_credit_type',
      'reward_amount',
      'reward_requirement_type',
      'reward_requirement_count',
      'updated_at',
      'created_at',
      'id'
    );

  IF admin_role_id IS NOT NULL THEN
    UPDATE directus_presets
    SET layout_query =
      '{"tabular":{"fields":["title","level","is_active","reward_credit_type","reward_amount","reward_requirement_type","reward_requirement_count","starts_at","ends_at","created_at"],"sort":["-created_at"],"page":1}}'::json
    WHERE role = admin_role_id
      AND collection = 'app_announcements'
      AND "user" IS NULL
      AND bookmark IS NULL;
  END IF;
END $$;
