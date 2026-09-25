CREATE TABLE IF NOT EXISTS learning_items (
  id uuid PRIMARY KEY,
  user_id uuid NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  lemma text NOT NULL,
  vocab text NOT NULL,
  source_lang text NOT NULL,
  target_lang text NOT NULL,
  status text NOT NULL DEFAULT 'active',
  encounter_count integer NOT NULL DEFAULT 1,
  last_seen_mode text NOT NULL,
  last_meaning text NOT NULL,
  last_short_explanation text NOT NULL,
  last_lookup_at timestamptz NOT NULL DEFAULT now(),
  learned_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  CHECK (status IN ('active', 'learned')),
  CHECK (encounter_count > 0),
  CHECK (last_seen_mode IN ('basic', 'advanced'))
);

CREATE INDEX IF NOT EXISTS learning_items_user_idx
  ON learning_items (user_id);

CREATE INDEX IF NOT EXISTS learning_items_user_status_idx
  ON learning_items (user_id, status);

CREATE INDEX IF NOT EXISTS learning_items_user_lookup_idx
  ON learning_items (user_id, last_lookup_at DESC);

CREATE UNIQUE INDEX IF NOT EXISTS learning_items_user_lemma_lang_uidx
  ON learning_items (user_id, lemma, source_lang, target_lang);
