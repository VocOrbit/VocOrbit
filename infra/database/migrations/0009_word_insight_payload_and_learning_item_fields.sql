ALTER TABLE lookups
  ADD COLUMN IF NOT EXISTS response_payload jsonb;

ALTER TABLE learning_items
  ADD COLUMN IF NOT EXISTS target_meaning text;

UPDATE learning_items
SET target_meaning = last_meaning
WHERE target_meaning IS NULL;

ALTER TABLE learning_items
  ALTER COLUMN target_meaning SET NOT NULL;

ALTER TABLE learning_items
  ADD COLUMN IF NOT EXISTS phonetic text;

ALTER TABLE learning_items
  ADD COLUMN IF NOT EXISTS latest_lookup_id uuid;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1
    FROM pg_constraint
    WHERE conname = 'learning_items_latest_lookup_fk'
  ) THEN
    ALTER TABLE learning_items
      ADD CONSTRAINT learning_items_latest_lookup_fk
      FOREIGN KEY (latest_lookup_id)
      REFERENCES lookups(id)
      ON DELETE SET NULL;
  END IF;
END $$;

CREATE INDEX IF NOT EXISTS learning_items_latest_lookup_idx
  ON learning_items (latest_lookup_id);
