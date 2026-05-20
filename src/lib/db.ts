export type Status =
  | 'not_started'
  | 'in_progress'
  | 'answered'
  | 'needs_clarification';

export type Priority = 'high' | 'medium' | 'low';

export const STATUS_VALUES: Status[] = [
  'not_started',
  'in_progress',
  'answered',
  'needs_clarification',
];

export const PRIORITY_VALUES: Priority[] = ['high', 'medium', 'low'];

export interface ResponseRow {
  project_slug: string;
  question_id: string;
  body: string;
  status: Status;
  priority: Priority;
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

export type AuditKind = 'body' | 'status' | 'priority';

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
      'SELECT project_slug, question_id, body, status, priority, updated_at, updated_by FROM responses WHERE project_slug = ?1 AND question_id = ?2'
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
  updatedBy: string
): Promise<ResponseRow> {
  const now = new Date().toISOString();
  const existing = await getResponse(db, project, questionId);
  const prevBody = existing?.body ?? null;
  const prevStatus = (existing?.status ?? 'not_started') as Status;

  // Auto-transition between not_started and in_progress based on whether
  // the body has content. Explicit user states (answered,
  // needs_clarification) survive body edits — those are intentional
  // assertions. Auto-transitions are NOT audited; the body change itself
  // is in audit_log and the implied status flip is derivable from it.
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
  patch: { status?: Status; priority?: Priority },
  updatedBy: string
): Promise<ResponseRow> {
  const now = new Date().toISOString();
  const existing = await getResponse(db, project, questionId);
  const prevStatus = existing?.status ?? null;
  const prevPriority = existing?.priority ?? null;
  let nextStatus = patch.status ?? existing?.status ?? 'not_started';
  const nextPriority = patch.priority ?? existing?.priority ?? 'medium';

  // Preserve the body-vs-status invariant: an empty body can never carry
  // 'in_progress' (that's the auto-derived "you've typed something" state).
  // If a toggle untoggles to 'in_progress' but the body is empty, store
  // 'not_started' instead. Explicit answered / needs_clarification are
  // honored regardless of body — they're deliberate human assertions.
  if (nextStatus === 'in_progress' && !(existing?.body ?? '').trim()) {
    nextStatus = 'not_started';
  }

  const statements = [
    db
      .prepare(
        `INSERT INTO responses (project_slug, question_id, status, priority, updated_at, updated_by)
         VALUES (?1, ?2, ?3, ?4, ?5, ?6)
         ON CONFLICT(project_slug, question_id) DO UPDATE SET
           status = excluded.status,
           priority = excluded.priority,
           updated_at = excluded.updated_at,
           updated_by = excluded.updated_by`
      )
      .bind(project, questionId, nextStatus, nextPriority, now, updatedBy),
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
  if (patch.priority !== undefined && patch.priority !== prevPriority) {
    statements.push(
      db
        .prepare(
          `INSERT INTO audit_log (project_slug, question_id, kind, prev_value, new_value, changed_by, changed_at)
           VALUES (?1, ?2, 'priority', ?3, ?4, ?5, ?6)`
        )
        .bind(project, questionId, prevPriority, nextPriority, updatedBy, now)
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
      'SELECT project_slug, question_id, body, status, priority, updated_at, updated_by FROM responses WHERE project_slug = ?1'
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
