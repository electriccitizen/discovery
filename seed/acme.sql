-- Demo seed data for the Acme project.
--
-- Idempotent: wipes all acme rows first, then inserts a small populated
-- worksheet — handful of responses across statuses, a flagged question, a
-- short comment thread, and a few audit-log entries so the digest preview
-- has something to render.
--
-- Run via: npm run seed:demo
-- (wrangler d1 execute discovery --local --file=./seed/acme.sql)

DELETE FROM comments WHERE project_slug = 'acme';
DELETE FROM audit_log WHERE project_slug = 'acme';
DELETE FROM responses WHERE project_slug = 'acme';
DELETE FROM notification_preferences WHERE project_slug = 'acme';

-- Responses: cover all four status values + one flagged.
INSERT INTO responses (project_slug, question_id, body, status, priority, flagged, updated_at, updated_by) VALUES
  ('acme', 'A1', 'We''re going with Pantheon — already have an account from a sibling project.', 'answered', 'medium', 0, '2026-05-18T14:22:10.000Z', 'client@acme.test'),
  ('acme', 'A2', 'Acme will hold the contract directly. Please send the EC team as collaborators once provisioned.', 'answered', 'medium', 0, '2026-05-18T14:25:44.000Z', 'client@acme.test'),
  ('acme', 'A3', '', 'not_started', 'medium', 0, '2026-05-19T09:00:00.000Z', 'tim@electriccitizen.com'),
  ('acme', 'B1', 'Working on getting access — should have it by end of week.', 'in_progress', 'medium', 1, '2026-05-20T11:08:00.000Z', 'client@acme.test'),
  ('acme', 'B2', '', 'not_started', 'medium', 0, '2026-05-19T09:00:00.000Z', 'tim@electriccitizen.com'),
  ('acme', 'B3', 'Not sure — let''s discuss on our next call.', 'needs_clarification', 'medium', 0, '2026-05-20T15:33:12.000Z', 'client@acme.test'),
  ('acme', 'C1', 'One-way: site submissions → Salesforce. Two-way is out of scope for v1.', 'answered', 'medium', 0, '2026-05-21T10:14:00.000Z', 'client@acme.test'),
  ('acme', 'C2', '', 'not_started', 'medium', 0, '2026-05-19T09:00:00.000Z', 'tim@electriccitizen.com'),
  ('acme', 'C3', '', 'not_started', 'medium', 0, '2026-05-19T09:00:00.000Z', 'tim@electriccitizen.com'),
  ('acme', 'D1', '', 'not_started', 'medium', 0, '2026-05-19T09:00:00.000Z', 'tim@electriccitizen.com'),
  ('acme', 'D2', '', 'not_started', 'medium', 0, '2026-05-19T09:00:00.000Z', 'tim@electriccitizen.com');

-- Audit log: capture the body/status transitions for the answered questions so
-- the per-question history view + digest "response edits" section has data.
INSERT INTO audit_log (project_slug, question_id, kind, prev_value, new_value, changed_by, changed_at) VALUES
  ('acme', 'A1', 'body',   NULL,             'We''re going with Pantheon — already have an account from a sibling project.', 'client@acme.test', '2026-05-18T14:22:10.000Z'),
  ('acme', 'A1', 'status', 'not_started',    'answered',                                                                       'client@acme.test', '2026-05-18T14:22:11.000Z'),
  ('acme', 'A2', 'body',   NULL,             'Acme will hold the contract directly. Please send the EC team as collaborators once provisioned.', 'client@acme.test', '2026-05-18T14:25:44.000Z'),
  ('acme', 'A2', 'status', 'not_started',    'answered',                                                                       'client@acme.test', '2026-05-18T14:25:45.000Z'),
  ('acme', 'B1', 'body',   NULL,             'Working on getting access — should have it by end of week.',                     'client@acme.test', '2026-05-20T11:08:00.000Z'),
  ('acme', 'B1', 'status', 'not_started',    'in_progress',                                                                    'client@acme.test', '2026-05-20T11:08:01.000Z'),
  ('acme', 'B1', 'flagged', '0',             '1',                                                                              'tim@electriccitizen.com', '2026-05-20T11:30:00.000Z'),
  ('acme', 'B3', 'body',   NULL,             'Not sure — let''s discuss on our next call.',                                    'client@acme.test', '2026-05-20T15:33:12.000Z'),
  ('acme', 'B3', 'status', 'not_started',    'needs_clarification',                                                            'client@acme.test', '2026-05-20T15:33:13.000Z'),
  ('acme', 'C1', 'body',   NULL,             'One-way: site submissions → Salesforce. Two-way is out of scope for v1.',        'client@acme.test', '2026-05-21T10:14:00.000Z'),
  ('acme', 'C1', 'status', 'not_started',    'answered',                                                                       'client@acme.test', '2026-05-21T10:14:01.000Z');

-- Comments: a short thread on B1, plus a couple of standalone EC notes.
INSERT INTO comments (project_slug, question_id, author_email, author_label, body, created_at) VALUES
  ('acme', 'B1', 'tim@electriccitizen.com', 'EC',     'Flagging this — the DB dump is the biggest single thing that determines migration effort. Worth chasing hard.', '2026-05-20T11:31:00.000Z'),
  ('acme', 'B1', 'client@acme.test',         'Acme',  'Understood. I''ve put a request in with IT, will follow up Wednesday if I haven''t heard.',                       '2026-05-20T13:02:14.000Z'),
  ('acme', 'B1', 'tim@electriccitizen.com', 'EC',     'Thanks. If IT punts, let''s set up a 15-min call with their lead — usually faster than email.',                   '2026-05-20T13:18:42.000Z'),
  ('acme', 'B3', 'tim@electriccitizen.com', 'EC',     'Happy to dig into this on Thursday''s call. No prep needed.',                                                     '2026-05-20T15:40:00.000Z'),
  ('acme', 'C2', 'tim@electriccitizen.com', 'EC',     'When you have a steer on Mailchimp vs HubSpot, drop it here and we''ll scope the integration work.',              '2026-05-21T09:02:00.000Z');

-- Notification preferences: subscribe tim + the demo client to the daily digest
-- so the cron worker has someone to send to when exercised locally.
INSERT INTO notification_preferences (email, project_slug, daily_digest, updated_at) VALUES
  ('tim@electriccitizen.com', 'acme', 1, '2026-05-19T09:00:00.000Z'),
  ('client@acme.test',         'acme', 1, '2026-05-19T09:00:00.000Z');
