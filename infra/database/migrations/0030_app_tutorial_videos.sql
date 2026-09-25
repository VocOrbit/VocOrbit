CREATE TABLE IF NOT EXISTS app_tutorial_videos (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  slug text NOT NULL,
  screen text NOT NULL,
  placement text NOT NULL,
  locale text NOT NULL DEFAULT 'en',
  title text NOT NULL,
  description text,
  youtube_url text NOT NULL,
  thumbnail_url text,
  duration_seconds integer,
  platform text NOT NULL DEFAULT 'all',
  priority integer NOT NULL DEFAULT 100,
  min_app_version text,
  max_app_version text,
  is_active boolean NOT NULL DEFAULT true,
  starts_at timestamptz,
  ends_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE UNIQUE INDEX IF NOT EXISTS app_tutorial_videos_slug_uidx
  ON app_tutorial_videos (slug);

CREATE INDEX IF NOT EXISTS app_tutorial_videos_filters_idx
  ON app_tutorial_videos (is_active, locale, screen, placement, platform, priority);

CREATE INDEX IF NOT EXISTS app_tutorial_videos_active_window_idx
  ON app_tutorial_videos (is_active, starts_at, ends_at, priority);

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1
    FROM pg_constraint
    WHERE conname = 'app_tutorial_videos_platform_check'
  ) THEN
    ALTER TABLE app_tutorial_videos
      ADD CONSTRAINT app_tutorial_videos_platform_check
      CHECK (platform IN ('all', 'ios', 'android'));
  END IF;

  IF NOT EXISTS (
    SELECT 1
    FROM pg_constraint
    WHERE conname = 'app_tutorial_videos_duration_seconds_check'
  ) THEN
    ALTER TABLE app_tutorial_videos
      ADD CONSTRAINT app_tutorial_videos_duration_seconds_check
      CHECK (duration_seconds IS NULL OR duration_seconds > 0);
  END IF;

  IF NOT EXISTS (
    SELECT 1
    FROM pg_constraint
    WHERE conname = 'app_tutorial_videos_priority_check'
  ) THEN
    ALTER TABLE app_tutorial_videos
      ADD CONSTRAINT app_tutorial_videos_priority_check
      CHECK (priority >= 0);
  END IF;

  IF NOT EXISTS (
    SELECT 1
    FROM pg_constraint
    WHERE conname = 'app_tutorial_videos_active_window_check'
  ) THEN
    ALTER TABLE app_tutorial_videos
      ADD CONSTRAINT app_tutorial_videos_active_window_check
      CHECK (starts_at IS NULL OR ends_at IS NULL OR ends_at > starts_at);
  END IF;
END $$;

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
  VALUES (
    'app_tutorial_videos',
    'smart_display',
    'In-app tutorial video links for screens and placements',
    false,
    false,
    'all',
    4
  )
  ON CONFLICT (collection) DO UPDATE SET
    icon = EXCLUDED.icon,
    note = EXCLUDED.note,
    hidden = EXCLUDED.hidden,
    singleton = EXCLUDED.singleton,
    accountability = EXCLUDED.accountability,
    sort = EXCLUDED.sort;

  UPDATE directus_collections
  SET "group" = CASE
        WHEN EXISTS (SELECT 1 FROM directus_collections WHERE collection = 'announcements')
          THEN 'announcements'
        WHEN EXISTS (SELECT 1 FROM directus_collections WHERE collection = 'grp_announcements')
          THEN 'grp_announcements'
        ELSE "group"
      END,
      sort = 4,
      display_template = '{{title}}'
  WHERE collection = 'app_tutorial_videos';
END $$;

DO $$
BEGIN
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
  SET sort = CASE field
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
        WHEN 'updated_at' THEN 17
        WHEN 'created_at' THEN 18
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
      note = CASE field
        WHEN 'slug' THEN 'Stable unique key for this tutorial entry.'
        WHEN 'screen' THEN 'Mobile screen identifier, for example vocabulary_detail.'
        WHEN 'placement' THEN 'UI placement identifier, for example advanced_analysis.'
        WHEN 'locale' THEN 'Language tag such as tr, en, es, zh-cn, or all.'
        WHEN 'youtube_url' THEN 'YouTube watch, shorts, embed, or youtu.be URL.'
        WHEN 'thumbnail_url' THEN 'Optional preview image URL shown before opening YouTube.'
        WHEN 'duration_seconds' THEN 'Optional video duration in seconds.'
        WHEN 'platform' THEN 'all, ios, or android.'
        WHEN 'priority' THEN 'Lower numbers are shown first.'
        WHEN 'min_app_version' THEN 'Optional minimum mobile app version.'
        WHEN 'max_app_version' THEN 'Optional maximum mobile app version.'
        ELSE note
      END
  WHERE collection = 'app_tutorial_videos';
END $$;
