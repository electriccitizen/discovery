-- @mention persistence. One row per (comment, mentioned email). Written at
-- comment-insert time by parsing the body for @email tokens that match the
-- project's mentionable set (EC roster + client_emails + project
-- participants — see src/pages/api/projects/[project]/mentionable.ts).
--
-- Internal-comment rule: if the parent comment has internal=1, only EC
-- emails are persisted as mentions. The post handler enforces this; the
-- table itself doesn't carry the internal flag (it's derivable via JOIN).

CREATE TABLE IF NOT EXISTS comment_mentions (
  comment_id       INTEGER NOT NULL REFERENCES comments(id) ON DELETE CASCADE,
  mentioned_email  TEXT NOT NULL,
  created_at       TEXT NOT NULL,
  PRIMARY KEY (comment_id, mentioned_email)
);

-- "What was I mentioned in over the last 24h" for the digest worker.
CREATE INDEX IF NOT EXISTS idx_mentions_email_time
  ON comment_mentions (mentioned_email, created_at);
