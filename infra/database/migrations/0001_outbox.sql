CREATE TABLE IF NOT EXISTS outbox_events (
  id uuid PRIMARY KEY,
  event_name text NOT NULL,
  aggregate_type text NOT NULL,
  aggregate_id text NOT NULL,
  payload jsonb NOT NULL,
  attempt integer NOT NULL DEFAULT 0,
  available_at timestamptz NOT NULL DEFAULT now(),
  published_at timestamptz,
  last_error text,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS outbox_events_pending_idx
  ON outbox_events (published_at, available_at, created_at);
