CREATE TABLE IF NOT EXISTS word_insight_jobs (
  id uuid PRIMARY KEY,
  user_id uuid NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  request_id text NOT NULL,
  status text NOT NULL DEFAULT 'queued',
  input_payload jsonb NOT NULL,
  context_payload jsonb NOT NULL,
  result_payload jsonb,
  error_code text,
  error_message text,
  attempt integer NOT NULL DEFAULT 0,
  started_at timestamptz,
  finished_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE UNIQUE INDEX IF NOT EXISTS word_insight_jobs_request_uidx
  ON word_insight_jobs (request_id);

CREATE INDEX IF NOT EXISTS word_insight_jobs_user_status_idx
  ON word_insight_jobs (user_id, status);

CREATE INDEX IF NOT EXISTS word_insight_jobs_queue_idx
  ON word_insight_jobs (status, created_at);

