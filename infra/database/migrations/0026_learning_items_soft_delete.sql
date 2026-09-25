ALTER TABLE learning_items
  ADD COLUMN IF NOT EXISTS deleted_at timestamptz;
