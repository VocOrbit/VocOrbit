CREATE TABLE IF NOT EXISTS purchases (
  id uuid PRIMARY KEY,
  user_id uuid NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  store text NOT NULL,
  sku text NOT NULL,
  status text NOT NULL,
  purchase_token text NOT NULL,
  original_transaction_id text,
  starts_at timestamptz NOT NULL,
  expires_at timestamptz,
  last_event_id text,
  monthly_paid_basic_topup integer NOT NULL DEFAULT 0,
  monthly_paid_advanced_topup integer NOT NULL DEFAULT 0,
  paid_basic_cap integer NOT NULL DEFAULT 0,
  paid_advanced_cap integer NOT NULL DEFAULT 0,
  raw_payload jsonb NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  CHECK (store IN ('apple', 'google')),
  CHECK (status IN ('pending', 'active', 'expired', 'canceled', 'refunded')),
  CHECK (monthly_paid_basic_topup >= 0),
  CHECK (monthly_paid_advanced_topup >= 0),
  CHECK (paid_basic_cap >= 0),
  CHECK (paid_advanced_cap >= 0)
);

CREATE UNIQUE INDEX IF NOT EXISTS purchases_store_token_uidx
  ON purchases (store, purchase_token);

CREATE INDEX IF NOT EXISTS purchases_user_idx
  ON purchases (user_id);

CREATE INDEX IF NOT EXISTS purchases_status_idx
  ON purchases (status);

CREATE INDEX IF NOT EXISTS purchases_expires_idx
  ON purchases (expires_at);
