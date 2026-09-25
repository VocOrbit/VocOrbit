CREATE TABLE IF NOT EXISTS learning_item_groups (
  id uuid PRIMARY KEY,
  user_id uuid NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  name text NOT NULL,
  created_at timestamptz NOT NULL DEFAULT NOW(),
  updated_at timestamptz NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS learning_item_groups_user_idx
  ON learning_item_groups (user_id, created_at);

CREATE UNIQUE INDEX IF NOT EXISTS learning_item_groups_user_name_uidx
  ON learning_item_groups (user_id, name);

CREATE TABLE IF NOT EXISTS learning_item_group_members (
  id uuid PRIMARY KEY,
  user_id uuid NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  group_id uuid NOT NULL REFERENCES learning_item_groups(id) ON DELETE CASCADE,
  item_id uuid NOT NULL REFERENCES learning_items(id) ON DELETE CASCADE,
  created_at timestamptz NOT NULL DEFAULT NOW()
);

CREATE UNIQUE INDEX IF NOT EXISTS learning_item_group_members_group_item_uidx
  ON learning_item_group_members (group_id, item_id);

CREATE INDEX IF NOT EXISTS learning_item_group_members_user_group_idx
  ON learning_item_group_members (user_id, group_id);

CREATE INDEX IF NOT EXISTS learning_item_group_members_user_item_idx
  ON learning_item_group_members (user_id, item_id);
