CREATE TABLE IF NOT EXISTS billing_events (
  id uuid PRIMARY KEY,
  user_id uuid NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  store text NOT NULL,
  event_id text NOT NULL,
  source text NOT NULL,
  purchase_token text NOT NULL,
  status text NOT NULL,
  raw_payload jsonb NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE UNIQUE INDEX IF NOT EXISTS billing_events_store_event_uidx
  ON billing_events (store, event_id);

CREATE INDEX IF NOT EXISTS billing_events_user_idx
  ON billing_events (user_id);

CREATE INDEX IF NOT EXISTS billing_events_token_idx
  ON billing_events (store, purchase_token);

CREATE TABLE IF NOT EXISTS billing_credit_cycles (
  id uuid PRIMARY KEY,
  user_id uuid NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  store text NOT NULL,
  purchase_token text NOT NULL,
  credit_type text NOT NULL,
  cycle_key text NOT NULL,
  event_id text NOT NULL,
  amount integer NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE UNIQUE INDEX IF NOT EXISTS billing_credit_cycles_token_type_cycle_uidx
  ON billing_credit_cycles (store, purchase_token, credit_type, cycle_key);

CREATE INDEX IF NOT EXISTS billing_credit_cycles_user_idx
  ON billing_credit_cycles (user_id);

CREATE INDEX IF NOT EXISTS billing_credit_cycles_token_idx
  ON billing_credit_cycles (store, purchase_token);
