DO $$
BEGIN
  IF EXISTS (
    SELECT 1
    FROM information_schema.columns
    WHERE table_schema = 'public'
      AND table_name = 'learning_items'
      AND column_name = 'last_short_explanation'
  ) AND NOT EXISTS (
    SELECT 1
    FROM information_schema.columns
    WHERE table_schema = 'public'
      AND table_name = 'learning_items'
      AND column_name = 'definition_l2'
  ) THEN
    ALTER TABLE learning_items
      RENAME COLUMN last_short_explanation TO definition_l2;
  END IF;
END $$;
