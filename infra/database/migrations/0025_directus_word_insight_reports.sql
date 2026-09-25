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
  VALUES (
    'word_insight_reports',
    'flag',
    'User reports for incorrect meaning/definition in context',
    false,
    false,
    'all',
    4,
    'open'
  )
  ON CONFLICT (collection) DO UPDATE SET
    icon = EXCLUDED.icon,
    note = EXCLUDED.note,
    hidden = EXCLUDED.hidden,
    singleton = EXCLUDED.singleton,
    accountability = EXCLUDED.accountability,
    sort = EXCLUDED.sort,
    collapse = EXCLUDED.collapse;

  UPDATE directus_collections
  SET "group" = 'vocabulary',
      sort = 4
  WHERE collection = 'word_insight_reports';

  UPDATE directus_collections
  SET display_template = '{{status}} • {{item_id}}'
  WHERE collection = 'word_insight_reports';

  INSERT INTO directus_fields (collection, field)
  SELECT cols.table_name, cols.column_name
  FROM information_schema.columns cols
  WHERE cols.table_schema = 'public'
    AND cols.table_name = 'word_insight_reports'
    AND NOT EXISTS (
      SELECT 1
      FROM directus_fields f
      WHERE f.collection = cols.table_name
        AND f.field = cols.column_name
    );

  UPDATE directus_fields
  SET readonly = true
  WHERE collection = 'word_insight_reports'
    AND field IN (
      'id',
      'user_id',
      'item_id',
      'lookup_id',
      'message',
      'snapshot',
      'created_at',
      'updated_at'
    );

  UPDATE directus_fields
  SET sort = CASE field
        WHEN 'status' THEN 1
        WHEN 'message' THEN 2
        WHEN 'item_id' THEN 3
        WHEN 'user_id' THEN 4
        WHEN 'lookup_id' THEN 5
        WHEN 'snapshot' THEN 6
        WHEN 'created_at' THEN 7
        WHEN 'updated_at' THEN 8
        WHEN 'id' THEN 99
        ELSE sort
      END,
      width = CASE field
        WHEN 'status' THEN 'half'
        WHEN 'item_id' THEN 'half'
        WHEN 'user_id' THEN 'half'
        WHEN 'lookup_id' THEN 'half'
        WHEN 'message' THEN 'full'
        WHEN 'snapshot' THEN 'full'
        ELSE width
      END,
      note = CASE field
        WHEN 'status' THEN 'Triaged by admin: open | resolved | dismissed'
        WHEN 'message' THEN 'User submitted report content from mobile app'
        WHEN 'snapshot' THEN 'Captured item/lookup data at report time'
        ELSE note
      END
  WHERE collection = 'word_insight_reports'
    AND field IN (
      'status',
      'message',
      'item_id',
      'user_id',
      'lookup_id',
      'snapshot',
      'created_at',
      'updated_at',
      'id'
    );

  IF admin_role_id IS NOT NULL THEN
    DELETE FROM directus_presets
    WHERE role = admin_role_id
      AND "user" IS NULL
      AND bookmark IS NULL
      AND collection = 'word_insight_reports';

    INSERT INTO directus_presets (role, collection, layout, layout_query, layout_options)
    VALUES
      (
        admin_role_id,
        'word_insight_reports',
        'tabular',
        '{"tabular":{"fields":["created_at","status","message","item_id","user_id","lookup_id","id"],"sort":["-created_at"],"page":1}}'::json,
        '{"tabular":{"dense":false}}'::json
      );
  END IF;
END $$;
