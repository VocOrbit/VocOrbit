CREATE TABLE IF NOT EXISTS exercise_sessions (
  id uuid PRIMARY KEY,
  user_id uuid NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  mode text NOT NULL,
  status text NOT NULL DEFAULT 'active',
  total_questions integer NOT NULL,
  required_today_questions integer NOT NULL DEFAULT 0,
  question_types jsonb NOT NULL DEFAULT '[]'::jsonb,
  timezone_offset_minutes integer NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  completed_at timestamptz
);

CREATE INDEX IF NOT EXISTS exercise_sessions_user_status_idx
  ON exercise_sessions (user_id, status);

CREATE INDEX IF NOT EXISTS exercise_sessions_user_created_idx
  ON exercise_sessions (user_id, created_at);

CREATE TABLE IF NOT EXISTS exercise_questions (
  id uuid PRIMARY KEY,
  session_id uuid NOT NULL REFERENCES exercise_sessions(id) ON DELETE CASCADE,
  user_id uuid NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  order_no integer NOT NULL,
  type text NOT NULL,
  item_id uuid REFERENCES learning_items(id) ON DELETE SET NULL,
  prompt text NOT NULL,
  options jsonb NOT NULL DEFAULT '[]'::jsonb,
  correct_answer text NOT NULL,
  explanation text,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE UNIQUE INDEX IF NOT EXISTS exercise_questions_session_order_uidx
  ON exercise_questions (session_id, order_no);

CREATE INDEX IF NOT EXISTS exercise_questions_session_idx
  ON exercise_questions (session_id);

CREATE INDEX IF NOT EXISTS exercise_questions_user_idx
  ON exercise_questions (user_id);

CREATE TABLE IF NOT EXISTS exercise_answers (
  id uuid PRIMARY KEY,
  session_id uuid NOT NULL REFERENCES exercise_sessions(id) ON DELETE CASCADE,
  question_id uuid NOT NULL REFERENCES exercise_questions(id) ON DELETE CASCADE,
  user_id uuid NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  answer text NOT NULL,
  is_correct boolean NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE UNIQUE INDEX IF NOT EXISTS exercise_answers_question_uidx
  ON exercise_answers (question_id);

CREATE INDEX IF NOT EXISTS exercise_answers_session_idx
  ON exercise_answers (session_id);

CREATE INDEX IF NOT EXISTS exercise_answers_user_idx
  ON exercise_answers (user_id);

