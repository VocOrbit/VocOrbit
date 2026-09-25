ALTER TABLE users ADD COLUMN IF NOT EXISTS home_region text;
ALTER TABLE users ADD COLUMN IF NOT EXISTS shard_id integer;
ALTER TABLE users ADD COLUMN IF NOT EXISTS home_region_assigned_at timestamptz;

UPDATE users
SET home_region = 'eu'
WHERE home_region IS NULL OR btrim(home_region) = '';

UPDATE users
SET shard_id = ((('x' || substr(md5(id::text), 1, 8))::bit(32)::int & 2147483647) % 16)
WHERE shard_id IS NULL OR shard_id < 0;

UPDATE users
SET home_region_assigned_at = COALESCE(home_region_assigned_at, NOW())
WHERE home_region_assigned_at IS NULL;

ALTER TABLE users ALTER COLUMN home_region SET DEFAULT 'eu';
ALTER TABLE users ALTER COLUMN shard_id SET DEFAULT 0;
ALTER TABLE users ALTER COLUMN home_region_assigned_at SET DEFAULT NOW();
ALTER TABLE users ALTER COLUMN home_region SET NOT NULL;
ALTER TABLE users ALTER COLUMN shard_id SET NOT NULL;
ALTER TABLE users ALTER COLUMN home_region_assigned_at SET NOT NULL;

CREATE INDEX IF NOT EXISTS users_home_region_shard_idx ON users (home_region, shard_id);

ALTER TABLE word_insight_jobs ADD COLUMN IF NOT EXISTS home_region text;
ALTER TABLE word_insight_jobs ADD COLUMN IF NOT EXISTS shard_id integer;
ALTER TABLE word_insight_jobs ADD COLUMN IF NOT EXISTS claimed_by_region text;
ALTER TABLE word_insight_jobs ADD COLUMN IF NOT EXISTS claimed_by_worker text;

UPDATE word_insight_jobs j
SET
  home_region = COALESCE(NULLIF(u.home_region, ''), 'eu'),
  shard_id = COALESCE(u.shard_id, 0)
FROM users u
WHERE u.id = j.user_id
  AND (j.home_region IS NULL OR j.shard_id IS NULL);

UPDATE word_insight_jobs
SET home_region = 'eu'
WHERE home_region IS NULL OR btrim(home_region) = '';

UPDATE word_insight_jobs
SET shard_id = 0
WHERE shard_id IS NULL OR shard_id < 0;

ALTER TABLE word_insight_jobs ALTER COLUMN home_region SET DEFAULT 'eu';
ALTER TABLE word_insight_jobs ALTER COLUMN shard_id SET DEFAULT 0;
ALTER TABLE word_insight_jobs ALTER COLUMN home_region SET NOT NULL;
ALTER TABLE word_insight_jobs ALTER COLUMN shard_id SET NOT NULL;

DROP INDEX IF EXISTS word_insight_jobs_queue_idx;
CREATE INDEX IF NOT EXISTS word_insight_jobs_queue_idx
  ON word_insight_jobs (status, home_region, shard_id, created_at);
