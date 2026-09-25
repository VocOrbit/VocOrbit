CREATE TABLE IF NOT EXISTS app_announcements (
  id uuid PRIMARY KEY,
  level text NOT NULL DEFAULT 'info',
  title text NOT NULL,
  body text NOT NULL,
  cta_label text,
  cta_url text,
  deep_link text,
  is_active boolean NOT NULL DEFAULT true,
  starts_at timestamptz,
  ends_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS app_announcements_active_window_idx
  ON app_announcements (is_active, starts_at, ends_at, created_at DESC);

CREATE INDEX IF NOT EXISTS app_announcements_created_at_idx
  ON app_announcements (created_at DESC);

CREATE TABLE IF NOT EXISTS app_announcement_reads (
  user_id uuid NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  announcement_id uuid NOT NULL REFERENCES app_announcements(id) ON DELETE CASCADE,
  read_at timestamptz NOT NULL DEFAULT now(),
  PRIMARY KEY (user_id, announcement_id)
);

CREATE INDEX IF NOT EXISTS app_announcement_reads_user_read_idx
  ON app_announcement_reads (user_id, read_at DESC);

CREATE INDEX IF NOT EXISTS app_announcement_reads_announcement_idx
  ON app_announcement_reads (announcement_id);
