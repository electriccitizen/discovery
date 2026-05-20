-- Replace the 3-tier `priority` column with a single boolean `flagged`.
-- See docs/PLAN.md revision log + commit messages for the rationale: in
-- practice the High/Med/Low triage levels were fake semantics; what EC
-- actually needs is one "answer this one next, it's blocking us" signal
-- that clients can see.
--
-- The `priority` column is left in place to preserve historical data
-- and minimize migration risk. It's no longer read or written by the
-- app. Future cleanup can drop the column once we're confident.

ALTER TABLE responses ADD COLUMN flagged INTEGER NOT NULL DEFAULT 0;

-- Preserve any existing "high priority" assignments as flagged so EC
-- triage already in flight survives the schema change.
UPDATE responses SET flagged = 1 WHERE priority = 'high';

CREATE INDEX IF NOT EXISTS idx_responses_flagged
  ON responses (project_slug, flagged)
  WHERE flagged = 1;
