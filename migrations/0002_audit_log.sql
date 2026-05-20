-- Audit log: one immutable row per response change.
--
-- Captures body / status / priority transitions in a single table so the
-- per-question history view can show a unified chronological list. The
-- current canonical values still live in `responses`; this table is the
-- before/after evidence trail.
--
-- `prev_value` is NULL on the first write (creating a new row).

CREATE TABLE IF NOT EXISTS audit_log (
  id           INTEGER PRIMARY KEY AUTOINCREMENT,
  project_slug TEXT NOT NULL,
  question_id  TEXT NOT NULL,
  kind         TEXT NOT NULL,            -- 'body' | 'status' | 'priority'
  prev_value   TEXT,                     -- nullable: NULL on first set
  new_value    TEXT NOT NULL,
  changed_by   TEXT NOT NULL,
  changed_at   TEXT NOT NULL             -- ISO8601
);

CREATE INDEX IF NOT EXISTS idx_audit_question
  ON audit_log (project_slug, question_id, changed_at);

CREATE INDEX IF NOT EXISTS idx_audit_project_time
  ON audit_log (project_slug, changed_at);
