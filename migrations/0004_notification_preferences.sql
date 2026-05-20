-- Per-user, per-project notification preferences. Currently a single
-- knob (daily_digest); structure leaves room to add per-event-type
-- toggles later without another schema migration if needed.

CREATE TABLE IF NOT EXISTS notification_preferences (
  email          TEXT NOT NULL,
  project_slug   TEXT NOT NULL,
  daily_digest   INTEGER NOT NULL DEFAULT 0,
  updated_at     TEXT NOT NULL,
  PRIMARY KEY (email, project_slug)
);

-- Partial index for the cron worker's "find subscribers for this project"
-- lookup. Only indexes opted-in rows; cheap on writes.
CREATE INDEX IF NOT EXISTS idx_prefs_project_digest
  ON notification_preferences (project_slug, email)
  WHERE daily_digest = 1;
