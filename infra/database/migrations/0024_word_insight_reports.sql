CREATE TABLE IF NOT EXISTS word_insight_reports (
  id uuid PRIMARY KEY,
  user_id uuid NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  item_id uuid NOT NULL REFERENCES learning_items(id) ON DELETE CASCADE,
  lookup_id uuid REFERENCES lookups(id) ON DELETE SET NULL,
  message text NOT NULL,
  status text NOT NULL DEFAULT 'open',
  snapshot jsonb NOT NULL DEFAULT '{}'::jsonb,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1
    FROM pg_constraint
    WHERE conname = 'word_insight_reports_status_check'
  ) THEN
    ALTER TABLE word_insight_reports
      ADD CONSTRAINT word_insight_reports_status_check
      CHECK (status IN ('open', 'resolved', 'dismissed'));
  END IF;
END $$;

CREATE INDEX IF NOT EXISTS word_insight_reports_user_idx
  ON word_insight_reports (user_id);

CREATE INDEX IF NOT EXISTS word_insight_reports_item_idx
  ON word_insight_reports (item_id);

CREATE INDEX IF NOT EXISTS word_insight_reports_status_idx
  ON word_insight_reports (status, created_at DESC);
