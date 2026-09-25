DROP INDEX IF EXISTS word_insight_jobs_request_uidx;

CREATE UNIQUE INDEX IF NOT EXISTS word_insight_jobs_request_uidx
  ON word_insight_jobs (user_id, request_id);
