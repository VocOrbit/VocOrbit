ALTER TABLE learning_items
  DROP CONSTRAINT IF EXISTS learning_items_status_check;

ALTER TABLE learning_items
  ADD CONSTRAINT learning_items_status_check
  CHECK (status IN ('active', 'learned', 'deleted'));
