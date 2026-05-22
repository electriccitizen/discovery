-- Internal (EC-only) comments. Hard rule: clients must never see that an
-- internal comment exists — no row, no count, no placeholder. Enforced on
-- every read path by passing the viewer's role through to the list helpers
-- in src/lib/db.ts; the digest worker filters per recipient. The UI hides
-- the composer checkbox for non-EC viewers, but the binding contract is
-- the server-side WHERE clause, not the markup.

ALTER TABLE comments ADD COLUMN internal INTEGER NOT NULL DEFAULT 0;

-- Per-question reads already filter on (project_slug, question_id); the
-- partial index keeps internal-only lookups cheap without inflating the
-- main thread index.
CREATE INDEX IF NOT EXISTS idx_comments_internal
  ON comments (project_slug, question_id, created_at)
  WHERE internal = 1;
