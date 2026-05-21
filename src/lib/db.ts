export type Status =
  | 'not_started'
  | 'in_progress'
  | 'answered';

export type Priority = 'high' | 'medium' | 'low';

export const STATUS_VALUES: Status[] = [
  'not_started',
  'in_progress',
  'answered',
];

export const PRIORITY_VALUES: Priority[] = ['high', 'medium', 'low'];

export interface ResponseRow {
  project_slug: string;
  question_id: string;
  body: string;
  status: Status;
  priority: Priority;       // legacy column, no longer read or written
  flagged: number;          // 0 or 1 — EC focus flag
  updated_at: string;
  updated_by: string;
}

export interface CommentRow {
  id: number;
  project_slug: string;
  question_id: string;
  author_email: string;
  author_label: string;
  body: string;
  created_at: string;
}

export type AuditKind = 'body' | 'status' | 'priority' | 'flag' | 'notification_pref';

export interface AuditRow {
  id: number;
  project_slug: string;
  question_id: string;
  kind: AuditKind;
  prev_value: string | null;
  new_value: string;
  changed_by: string;
  changed_at: string;
}

export function isStatus(value: unknown): value is Status {
  return typeof value === 'string' && (STATUS_VALUES as string[]).includes(value);
}

export function isPriority(value: unknown): value is Priority {
  return typeof value === 'string' && (PRIORITY_VALUES as string[]).includes(value);
}

export async function getResponse(
  db: D1Database,
  project: string,
  questionId: string
): Promise<ResponseRow | null> {
  const row = await db
    .prepare(
      'SELECT project_slug, question_id, body, status, priority, flagged, updated_at, updated_by FROM responses WHERE project_slug = ?1 AND question_id = ?2'
    )
    .bind(project, questionId)
    .first<ResponseRow>();
  return row ?? null;
}

export async function upsertResponseBody(
  db: D1Database,
  project: string,
  questionId: string,
  body: string,
  updatedBy: string,
  opts?: { clear?: boolean }
): Promise<ResponseRow> {
  const now = new Date().toISOString();
  const existing = await getResponse(db, project, questionId);
  const prevBody = existing?.body ?? null;
  const prevStatus = (existing?.status ?? 'not_started') as Status;

  // Data-loss guard: never let a save silently overwrite a non-empty body
  // with an empty one unless the caller has explicitly opted in via
  // `clear: true`. This blocks autosave races, form-state bugs, and
  // accidental cross-user wipes (we lost Albino's first answer this way).
  // The legitimate "user wants to delete their answer" path must pass the
  // flag explicitly.
  if (
    !opts?.clear &&
    body.trim().length === 0 &&
    (prevBody ?? '').trim().length > 0 &&
    existing
  ) {
    return existing;
  }

  // Auto-transition between not_started and in_progress based on whether
  // the body has content. Explicit 'answered' survives body edits — it's
  // an intentional assertion. Auto-transitions are NOT audited; the body
  // change itself is in audit_log and the implied status flip is
  // derivable from it.
  const bodyHasContent = body.trim().length > 0;
  let nextStatus: Status = prevStatus;
  if (prevStatus === 'not_started' && bodyHasContent) nextStatus = 'in_progress';
  else if (prevStatus === 'in_progress' && !bodyHasContent) nextStatus = 'not_started';

  const statements = [
    db
      .prepare(
        `INSERT INTO responses (project_slug, question_id, body, status, updated_at, updated_by)
         VALUES (?1, ?2, ?3, ?4, ?5, ?6)
         ON CONFLICT(project_slug, question_id) DO UPDATE SET
           body = excluded.body,
           status = excluded.status,
           updated_at = excluded.updated_at,
           updated_by = excluded.updated_by`
      )
      .bind(project, questionId, body, nextStatus, now, updatedBy),
  ];

  if (prevBody !== body) {
    statements.push(
      db
        .prepare(
          `INSERT INTO audit_log (project_slug, question_id, kind, prev_value, new_value, changed_by, changed_at)
           VALUES (?1, ?2, 'body', ?3, ?4, ?5, ?6)`
        )
        .bind(project, questionId, prevBody, body, updatedBy, now)
    );
  }

  await db.batch(statements);

  const row = await getResponse(db, project, questionId);
  if (!row) throw new Error('response upsert returned no row');
  return row;
}

export async function upsertResponseStatus(
  db: D1Database,
  project: string,
  questionId: string,
  patch: { status?: Status; flagged?: boolean },
  updatedBy: string
): Promise<ResponseRow> {
  const now = new Date().toISOString();
  const existing = await getResponse(db, project, questionId);
  const prevStatus = existing?.status ?? null;
  const prevFlagged = existing?.flagged ?? 0;
  let nextStatus = patch.status ?? existing?.status ?? 'not_started';
  let nextFlagged = patch.flagged === undefined ? prevFlagged : (patch.flagged ? 1 : 0);

  // Body-vs-status invariant: an empty body can never carry 'in_progress'.
  if (nextStatus === 'in_progress' && !(existing?.body ?? '').trim()) {
    nextStatus = 'not_started';
  }

  // Marking a question as answered resolves the priority signal — the
  // "answer this one next" prompt has been honored, so the flag clears
  // automatically. The flag change is still audited (attributed to
  // whoever marked answered).
  if (nextStatus === 'answered' && prevFlagged === 1) {
    nextFlagged = 0;
  }

  const statements = [
    db
      .prepare(
        `INSERT INTO responses (project_slug, question_id, status, flagged, updated_at, updated_by)
         VALUES (?1, ?2, ?3, ?4, ?5, ?6)
         ON CONFLICT(project_slug, question_id) DO UPDATE SET
           status = excluded.status,
           flagged = excluded.flagged,
           updated_at = excluded.updated_at,
           updated_by = excluded.updated_by`
      )
      .bind(project, questionId, nextStatus, nextFlagged, now, updatedBy),
  ];

  if (patch.status !== undefined && patch.status !== prevStatus) {
    statements.push(
      db
        .prepare(
          `INSERT INTO audit_log (project_slug, question_id, kind, prev_value, new_value, changed_by, changed_at)
           VALUES (?1, ?2, 'status', ?3, ?4, ?5, ?6)`
        )
        .bind(project, questionId, prevStatus, nextStatus, updatedBy, now)
    );
  }
  // Audit any actual flag change — explicit (patch.flagged provided) or
  // implicit (auto-cleared on answered). The audit row carries the
  // user whose action triggered it.
  if (nextFlagged !== prevFlagged) {
    statements.push(
      db
        .prepare(
          `INSERT INTO audit_log (project_slug, question_id, kind, prev_value, new_value, changed_by, changed_at)
           VALUES (?1, ?2, 'flag', ?3, ?4, ?5, ?6)`
        )
        .bind(project, questionId, String(prevFlagged), String(nextFlagged), updatedBy, now)
    );
  }

  await db.batch(statements);

  const row = await getResponse(db, project, questionId);
  if (!row) throw new Error('response status upsert returned no row');
  return row;
}

export async function listAllAudit(
  db: D1Database,
  project: string
): Promise<AuditRow[]> {
  const result = await db
    .prepare(
      'SELECT id, project_slug, question_id, kind, prev_value, new_value, changed_by, changed_at FROM audit_log WHERE project_slug = ?1 ORDER BY changed_at ASC, id ASC'
    )
    .bind(project)
    .all<AuditRow>();
  return result.results ?? [];
}

export async function listResponses(
  db: D1Database,
  project: string
): Promise<ResponseRow[]> {
  const result = await db
    .prepare(
      'SELECT project_slug, question_id, body, status, priority, flagged, updated_at, updated_by FROM responses WHERE project_slug = ?1'
    )
    .bind(project)
    .all<ResponseRow>();
  return result.results ?? [];
}

export async function listComments(
  db: D1Database,
  project: string,
  questionId: string
): Promise<CommentRow[]> {
  const result = await db
    .prepare(
      'SELECT id, project_slug, question_id, author_email, author_label, body, created_at FROM comments WHERE project_slug = ?1 AND question_id = ?2 ORDER BY created_at ASC, id ASC'
    )
    .bind(project, questionId)
    .all<CommentRow>();
  return result.results ?? [];
}

export async function listAllComments(
  db: D1Database,
  project: string
): Promise<CommentRow[]> {
  const result = await db
    .prepare(
      'SELECT id, project_slug, question_id, author_email, author_label, body, created_at FROM comments WHERE project_slug = ?1 ORDER BY created_at ASC, id ASC'
    )
    .bind(project)
    .all<CommentRow>();
  return result.results ?? [];
}

export interface ActivityItem {
  kind: 'response' | 'comment';
  question_id: string;
  author_email: string;
  body: string;
  at: string;
}

export async function listRecentActivity(
  db: D1Database,
  project: string,
  limit = 12
): Promise<ActivityItem[]> {
  const result = await db
    .prepare(
      `SELECT 'response' AS kind, question_id, updated_by AS author_email, body, updated_at AS at
         FROM responses
         WHERE project_slug = ?1 AND length(body) > 0
       UNION ALL
       SELECT 'comment'  AS kind, question_id, author_email, body, created_at AS at
         FROM comments
         WHERE project_slug = ?1
       ORDER BY at DESC
       LIMIT ?2`
    )
    .bind(project, limit)
    .all<ActivityItem>();
  return result.results ?? [];
}

export interface NotificationPref {
  email: string;
  project_slug: string;
  daily_digest: number;       // 0 or 1
  updated_at: string;
}

export async function getNotificationPref(
  db: D1Database,
  email: string,
  project: string
): Promise<NotificationPref | null> {
  const row = await db
    .prepare(
      'SELECT email, project_slug, daily_digest, updated_at FROM notification_preferences WHERE email = ?1 AND project_slug = ?2'
    )
    .bind(email, project)
    .first<NotificationPref>();
  return row ?? null;
}

export async function upsertNotificationPref(
  db: D1Database,
  email: string,
  project: string,
  dailyDigest: boolean
): Promise<NotificationPref> {
  const now = new Date().toISOString();
  const existing = await getNotificationPref(db, email, project);
  const prev = existing?.daily_digest ?? 0;
  const next = dailyDigest ? 1 : 0;

  const statements = [
    db
      .prepare(
        `INSERT INTO notification_preferences (email, project_slug, daily_digest, updated_at)
         VALUES (?1, ?2, ?3, ?4)
         ON CONFLICT(email, project_slug) DO UPDATE SET
           daily_digest = excluded.daily_digest,
           updated_at = excluded.updated_at`
      )
      .bind(email, project, next, now),
  ];

  // Audit the preference change. question_id is null-equivalent ('') since
  // the change is project-scoped, not question-scoped — keeps the existing
  // NOT NULL constraint happy without a schema change.
  if (next !== prev) {
    statements.push(
      db
        .prepare(
          `INSERT INTO audit_log (project_slug, question_id, kind, prev_value, new_value, changed_by, changed_at)
           VALUES (?1, '', 'notification_pref', ?2, ?3, ?4, ?5)`
        )
        .bind(project, `daily_digest=${prev}`, `daily_digest=${next}`, email, now)
    );
  }

  await db.batch(statements);

  const row = await getNotificationPref(db, email, project);
  if (!row) throw new Error('notification pref upsert returned no row');
  return row;
}

export async function listDigestSubscribers(
  db: D1Database,
  project: string
): Promise<string[]> {
  const result = await db
    .prepare(
      'SELECT email FROM notification_preferences WHERE project_slug = ?1 AND daily_digest = 1'
    )
    .bind(project)
    .all<{ email: string }>();
  return (result.results ?? []).map((r) => r.email);
}

export async function addComment(
  db: D1Database,
  project: string,
  questionId: string,
  authorEmail: string,
  authorLabel: string,
  body: string
): Promise<CommentRow> {
  const now = new Date().toISOString();
  const inserted = await db
    .prepare(
      `INSERT INTO comments (project_slug, question_id, author_email, author_label, body, created_at)
       VALUES (?1, ?2, ?3, ?4, ?5, ?6)
       RETURNING id, project_slug, question_id, author_email, author_label, body, created_at`
    )
    .bind(project, questionId, authorEmail, authorLabel, body, now)
    .first<CommentRow>();
  if (!inserted) throw new Error('comment insert returned no row');
  return inserted;
}
