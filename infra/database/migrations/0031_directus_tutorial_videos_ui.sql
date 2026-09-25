DO $$
DECLARE
  admin_role_id uuid;
BEGIN
  IF to_regclass('public.directus_collections') IS NULL THEN
    RETURN;
  END IF;

  IF to_regclass('public.app_tutorial_videos') IS NULL THEN
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
    'app_tutorial_videos',
    'smart_display',
    'YouTube tutorial links shown contextually inside the mobile app',
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
  SET "group" = CASE
        WHEN EXISTS (SELECT 1 FROM directus_collections WHERE collection = 'announcements')
          THEN 'announcements'
        WHEN EXISTS (SELECT 1 FROM directus_collections WHERE collection = 'grp_announcements')
          THEN 'grp_announcements'
        ELSE "group"
      END,
      sort = 4,
      display_template = '{{title}} - {{screen}}/{{placement}}'
  WHERE collection = 'app_tutorial_videos';

  IF to_regclass('public.directus_fields') IS NULL THEN
    RETURN;
  END IF;

  INSERT INTO directus_fields (collection, field)
  SELECT cols.table_name, cols.column_name
  FROM information_schema.columns cols
  WHERE cols.table_schema = 'public'
    AND cols.table_name = 'app_tutorial_videos'
    AND NOT EXISTS (
      SELECT 1
      FROM directus_fields f
      WHERE f.collection = cols.table_name
        AND f.field = cols.column_name
    );

  UPDATE directus_fields
  SET readonly = true,
      hidden = false,
      sort = CASE field
        WHEN 'id' THEN 99
        WHEN 'created_at' THEN 97
        WHEN 'updated_at' THEN 98
        ELSE sort
      END,
      width = CASE field
        WHEN 'id' THEN 'full'
        WHEN 'created_at' THEN 'half'
        WHEN 'updated_at' THEN 'half'
        ELSE width
      END
  WHERE collection = 'app_tutorial_videos'
    AND field IN ('id', 'created_at', 'updated_at');

  UPDATE directus_fields
  SET required = CASE
        WHEN field IN ('slug', 'screen', 'placement', 'locale', 'title', 'youtube_url', 'platform', 'priority', 'is_active') THEN true
        ELSE false
      END,
      hidden = false,
      readonly = CASE
        WHEN field IN ('id', 'created_at', 'updated_at') THEN true
        ELSE false
      END,
      sort = CASE field
        WHEN 'title' THEN 1
        WHEN 'slug' THEN 2
        WHEN 'screen' THEN 3
        WHEN 'placement' THEN 4
        WHEN 'locale' THEN 5
        WHEN 'youtube_url' THEN 6
        WHEN 'thumbnail_url' THEN 7
        WHEN 'duration_seconds' THEN 8
        WHEN 'platform' THEN 9
        WHEN 'priority' THEN 10
        WHEN 'is_active' THEN 11
        WHEN 'starts_at' THEN 12
        WHEN 'ends_at' THEN 13
        WHEN 'min_app_version' THEN 14
        WHEN 'max_app_version' THEN 15
        WHEN 'description' THEN 16
        WHEN 'created_at' THEN 97
        WHEN 'updated_at' THEN 98
        WHEN 'id' THEN 99
        ELSE sort
      END,
      width = CASE field
        WHEN 'title' THEN 'full'
        WHEN 'description' THEN 'full'
        WHEN 'youtube_url' THEN 'full'
        WHEN 'thumbnail_url' THEN 'full'
        WHEN 'slug' THEN 'half'
        WHEN 'screen' THEN 'half'
        WHEN 'placement' THEN 'half'
        WHEN 'locale' THEN 'half'
        WHEN 'duration_seconds' THEN 'half'
        WHEN 'platform' THEN 'half'
        WHEN 'priority' THEN 'half'
        WHEN 'is_active' THEN 'half'
        WHEN 'starts_at' THEN 'half'
        WHEN 'ends_at' THEN 'half'
        WHEN 'min_app_version' THEN 'half'
        WHEN 'max_app_version' THEN 'half'
        ELSE width
      END,
      interface = CASE field
        WHEN 'screen' THEN 'select-dropdown'
        WHEN 'placement' THEN 'select-dropdown'
        WHEN 'platform' THEN 'select-dropdown'
        WHEN 'is_active' THEN 'boolean'
        WHEN 'description' THEN 'input-multiline'
        WHEN 'starts_at' THEN 'datetime'
        WHEN 'ends_at' THEN 'datetime'
        ELSE 'input'
      END,
      options = CASE field
        WHEN 'screen' THEN
          '{"choices":[{"text":"How to use overview","value":"vocabulary_how_to_use"},{"text":"Vocabulary detail","value":"vocabulary_detail"}]}'::json
        WHEN 'placement' THEN
          '{"choices":[{"text":"Overview video","value":"overview"},{"text":"Word detail video","value":"word_detail"},{"text":"Advanced analysis video","value":"advanced_analysis"}]}'::json
        WHEN 'platform' THEN
          '{"choices":[{"text":"All platforms","value":"all"},{"text":"iOS only","value":"ios"},{"text":"Android only","value":"android"}]}'::json
        WHEN 'duration_seconds' THEN '{"min":1}'::json
        WHEN 'priority' THEN '{"min":0}'::json
        ELSE options
      END,
      note = CASE field
        WHEN 'title' THEN 'Short label shown on the mobile tutorial button/card.'
        WHEN 'slug' THEN 'Unique stable key, for example advanced-analysis-tr.'
        WHEN 'screen' THEN 'Mobile screen where the tutorial appears.'
        WHEN 'placement' THEN 'Exact UI area inside the selected screen.'
        WHEN 'locale' THEN 'Language tag such as tr, en, es, zh-cn, or all. Mobile falls back from tr-tr to tr, en, all.'
        WHEN 'youtube_url' THEN 'YouTube watch, shorts, embed, or youtu.be URL opened from mobile.'
        WHEN 'thumbnail_url' THEN 'Optional thumbnail URL. Mobile can use it later if needed.'
        WHEN 'duration_seconds' THEN 'Optional video duration in seconds.'
        WHEN 'platform' THEN 'Use all unless the video is platform-specific.'
        WHEN 'priority' THEN 'Lower numbers appear first when more than one video matches.'
        WHEN 'is_active' THEN 'Turn off to hide this tutorial without deleting it.'
        WHEN 'starts_at' THEN 'Optional publish start time.'
        WHEN 'ends_at' THEN 'Optional publish end time.'
        WHEN 'min_app_version' THEN 'Optional minimum app version that can see this tutorial.'
        WHEN 'max_app_version' THEN 'Optional maximum app version that can see this tutorial.'
        WHEN 'description' THEN 'Optional short supporting text shown on banner-style tutorial cards.'
        ELSE note
      END
  WHERE collection = 'app_tutorial_videos';

  IF admin_role_id IS NOT NULL THEN
    DELETE FROM directus_presets
    WHERE role = admin_role_id
      AND "user" IS NULL
      AND bookmark IS NULL
      AND collection = 'app_tutorial_videos';

    INSERT INTO directus_presets (role, collection, layout, layout_query, layout_options)
    VALUES (
      admin_role_id,
      'app_tutorial_videos',
      'tabular',
      '{"tabular":{"fields":["title","screen","placement","locale","platform","is_active","priority","starts_at","ends_at","updated_at"],"sort":["priority","-updated_at"],"page":1}}'::json,
      '{"tabular":{"dense":false}}'::json
    );
  END IF;
END $$;
