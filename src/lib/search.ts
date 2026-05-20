// Project-scoped keyword search across worksheet questions, response
// bodies, comments, and reference doc bodies. Plain substring match,
// case-insensitive, no FTS5/tokenization. Sized for the discovery
// corpus (~60 questions, low-volume D1).

import type { CommentRow, ResponseRow } from './db.ts';
import type { Section, Question } from './worksheet.ts';
import type { ReferenceDoc } from './projects.ts';

export type SearchResultKind = 'question' | 'response' | 'comment' | 'reference';

export interface SearchResult {
  kind: SearchResultKind;
  /** Deep link URL to the matched item */
  href: string;
  /** Short label shown as a chip (e.g. "G3", "A1"). Empty for references. */
  badge: string;
  /** Where this match lives — section title for questions/responses/comments, doc title for refs */
  context: string;
  /** Title-line text (e.g. the question title or doc heading) */
  title: string;
  /** HTML snippet with the matched term wrapped in <mark> */
  snippet: string;
  /** Author info for comments only */
  authorEmail?: string;
  authorLabel?: string;
  createdAt?: string;
}

const STRIP_TAGS = /<[^>]+>/g;
const COLLAPSE_WS = /\s+/g;

function plain(html: string): string {
  return html.replace(STRIP_TAGS, ' ').replace(COLLAPSE_WS, ' ').trim();
}

function escapeHtml(s: string): string {
  return s
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

function makeSnippet(text: string, q: string, context = 90): string {
  if (!text) return '';
  const lower = text.toLowerCase();
  const ql = q.toLowerCase();
  const idx = lower.indexOf(ql);
  if (idx < 0) {
    const cap = text.length > context * 2 ? text.slice(0, context * 2) + '…' : text;
    return escapeHtml(cap);
  }
  const start = Math.max(0, idx - context);
  const end = Math.min(text.length, idx + q.length + context);
  const before = start > 0 ? '…' : '';
  const after = end < text.length ? '…' : '';
  const pre = text.slice(start, idx);
  const matched = text.slice(idx, idx + q.length);
  const post = text.slice(idx + q.length, end);
  return `${before}${escapeHtml(pre)}<mark>${escapeHtml(matched)}</mark>${escapeHtml(post)}${after}`;
}

function questionSearchableText(q: Question): string {
  return [
    q.title,
    plain(q.bodyHtml),
    plain(q.whyHtml ?? ''),
    plain(q.expectedHtml ?? ''),
    plain(q.recommendationHtml ?? ''),
  ]
    .filter(Boolean)
    .join('\n');
}

export interface SearchInputs {
  projectSlug: string;
  query: string;
  sections: Section[];
  responses: ResponseRow[];
  comments: CommentRow[];
  references: ReferenceDoc[];
}

export interface SearchOutput {
  questions: SearchResult[];
  responses: SearchResult[];
  comments: SearchResult[];
  references: SearchResult[];
  total: number;
}

export function search(input: SearchInputs): SearchOutput {
  const q = input.query.trim();
  if (q.length < 2) {
    return { questions: [], responses: [], comments: [], references: [], total: 0 };
  }
  const ql = q.toLowerCase();

  // Build a question-id → section index so response / comment results
  // can show the section context and deep-link to the question anchor.
  const sectionByLetter = new Map<string, Section>();
  for (const s of input.sections) sectionByLetter.set(s.id, s);
  const questionById = new Map<string, { section: Section; question: Question }>();
  for (const s of input.sections) {
    for (const qq of s.questions) {
      questionById.set(qq.id, { section: s, question: qq });
    }
  }

  function sectionOf(questionId: string): Section | null {
    const letter = questionId.match(/^([A-Z])/)?.[1];
    return letter ? sectionByLetter.get(letter) ?? null : null;
  }

  const questions: SearchResult[] = [];
  for (const section of input.sections) {
    for (const qq of section.questions) {
      const text = questionSearchableText(qq);
      if (text.toLowerCase().includes(ql)) {
        questions.push({
          kind: 'question',
          href: `/${input.projectSlug}/section/${section.slug}#${qq.id}`,
          badge: qq.id,
          context: `${section.id}. ${section.title}`,
          title: qq.title,
          snippet: makeSnippet(text, q),
        });
      }
    }
  }

  const responses: SearchResult[] = [];
  for (const r of input.responses) {
    if (!r.body) continue;
    if (r.body.toLowerCase().includes(ql)) {
      const ctx = questionById.get(r.question_id);
      const section = ctx?.section ?? sectionOf(r.question_id);
      responses.push({
        kind: 'response',
        href: section
          ? `/${input.projectSlug}/section/${section.slug}#${r.question_id}`
          : `/${input.projectSlug}`,
        badge: r.question_id,
        context: section ? `${section.id}. ${section.title}` : '',
        title: ctx?.question.title ?? r.question_id,
        snippet: makeSnippet(r.body, q),
      });
    }
  }

  const comments: SearchResult[] = [];
  for (const c of input.comments) {
    if (c.body.toLowerCase().includes(ql)) {
      const ctx = questionById.get(c.question_id);
      const section = ctx?.section ?? sectionOf(c.question_id);
      comments.push({
        kind: 'comment',
        href: section
          ? `/${input.projectSlug}/section/${section.slug}#${c.question_id}`
          : `/${input.projectSlug}`,
        badge: c.question_id,
        context: section ? `${section.id}. ${section.title}` : '',
        title: ctx?.question.title ?? c.question_id,
        snippet: makeSnippet(c.body, q),
        authorEmail: c.author_email,
        authorLabel: c.author_label,
        createdAt: c.created_at,
      });
    }
  }

  const references: SearchResult[] = [];
  for (const ref of input.references) {
    const body = plain(ref.html);
    const titleHit = ref.title.toLowerCase().includes(ql);
    const bodyHit = body.toLowerCase().includes(ql);
    if (titleHit || bodyHit) {
      references.push({
        kind: 'reference',
        href: `/${input.projectSlug}/reference/${ref.slug}`,
        badge: '',
        context: 'Reference document',
        title: ref.title,
        snippet: makeSnippet(bodyHit ? body : ref.title, q),
      });
    }
  }

  return {
    questions,
    responses,
    comments,
    references,
    total: questions.length + responses.length + comments.length + references.length,
  };
}
