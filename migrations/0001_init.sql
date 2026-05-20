-- Discovery Portal — initial D1 schema.
--
-- Responses: one row per (project, question). Status + priority live here
-- alongside the body since they're all the same write surface (one client
-- working through one question).
--
-- Comments: append-only thread per question. Author email + label come
-- from the Cf-Access-Authenticated-User-Email header at write time.

CREATE TABLE IF NOT EXISTS responses (
  project_slug TEXT NOT NULL,
  question_id  TEXT NOT NULL,
  body         TEXT NOT NULL DEFAULT '',
  status       TEXT NOT NULL DEFAULT 'not_started',
                -- not_started | in_progress | answered | needs_clarification
  priority     TEXT NOT NULL DEFAULT 'medium',
                -- high | medium | low
  updated_at   TEXT NOT NULL,
  updated_by   TEXT NOT NULL,
  PRIMARY KEY (project_slug, question_id)
);

CREATE TABLE IF NOT EXISTS comments (
  id           INTEGER PRIMARY KEY AUTOINCREMENT,
  project_slug TEXT NOT NULL,
  question_id  TEXT NOT NULL,
  author_email TEXT NOT NULL,
  author_label TEXT NOT NULL,
  body         TEXT NOT NULL,
  created_at   TEXT NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_comments_question
  ON comments (project_slug, question_id, created_at);
