ALTER TABLE learning_items
  ADD COLUMN IF NOT EXISTS is_favorite boolean NOT NULL DEFAULT false;

ALTER TABLE learning_items
  ADD COLUMN IF NOT EXISTS favorited_at timestamptz;

CREATE INDEX IF NOT EXISTS learning_items_user_favorite_idx
  ON learning_items (user_id, is_favorite, last_lookup_at DESC);
