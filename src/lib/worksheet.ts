import matter from 'gray-matter';
import { marked } from 'marked';

export interface Question {
  id: string;
  title: string;
  bodyHtml: string;
  whyHtml: string | null;
  expectedHtml: string | null;
}

export interface Section {
  id: string;
  slug: string;
  title: string;
  order: number;
  introHtml: string;
  questions: Question[];
}

const worksheetFiles = import.meta.glob<string>(
  '/content/projects/*/worksheet/*.md',
  { query: '?raw', import: 'default', eager: true }
);

function parsePath(path: string): { project: string; slug: string } | null {
  const m = path.match(/\/content\/projects\/([^/]+)\/worksheet\/([^/]+)\.md$/);
  return m ? { project: m[1], slug: m[2] } : null;
}

function parseQuestionBlock(raw: string): Question {
  // Parse the header on the FIRST LINE ONLY so the regex can't accidentally
  // consume the bullets on the next line. Earlier version used a multiline
  // regex with `\s*` after the closing `**`, which greedily ate the trailing
  // newline and pulled the next line into the captured "header trailing"
  // text — causing the Why-we-ask bullet to be both prepended to the body
  // *and* still present in the original position, rendering as a duplicate.
  const firstNewlineIdx = raw.indexOf('\n');
  const firstLine = firstNewlineIdx === -1 ? raw : raw.slice(0, firstNewlineIdx);
  const restOfBlock = firstNewlineIdx === -1 ? '' : raw.slice(firstNewlineIdx + 1);

  const headerMatch = firstLine.match(/^\*\*([A-M]\d+)\.\s+(.+?)\*\*[ \t]*(.*)$/);
  if (!headerMatch) {
    throw new Error(`Could not parse question header in block:\n${raw.slice(0, 120)}`);
  }
  const id = headerMatch[1];
  const title = headerMatch[2].trim();
  const headerTrailing = headerMatch[3].trim();

  let body = restOfBlock.trim();
  if (headerTrailing) {
    body = body ? `${headerTrailing}\n\n${body}` : headerTrailing;
  }

  const whyRe = /(?:^|\n)\s*[-*]\s+\*Why we ask:\*\s+([\s\S]+?)(?=\n\s*[-*]\s+\*[A-Z]|\n\s*\n|$)/;
  const expectedRe = /(?:^|\n)\s*[-*]\s+\*Expected format:\*\s+([\s\S]+?)(?=\n\s*[-*]\s+\*[A-Z]|\n\s*\n|$)/;

  const whyMatch = body.match(whyRe);
  const expectedMatch = body.match(expectedRe);

  if (whyMatch) body = body.replace(whyMatch[0], '').trim();
  if (expectedMatch) body = body.replace(expectedMatch[0], '').trim();

  const why = whyMatch?.[1]?.trim() ?? null;
  const expected = expectedMatch?.[1]?.trim() ?? null;

  return {
    id,
    title,
    bodyHtml: body ? String(marked.parse(body)) : '',
    whyHtml: why ? String(marked.parseInline(why)) : null,
    expectedHtml: expected ? String(marked.parseInline(expected)) : null,
  };
}

function parseSection(raw: string, slug: string): Section {
  const parsed = matter(raw);
  const data = parsed.data as { id?: unknown; title?: unknown; order?: unknown };
  const content = parsed.content;

  let introMd = '';
  let questionsMd = '';

  const parts = content.split(/^### /m);
  for (const part of parts.slice(1)) {
    const newlineIdx = part.indexOf('\n');
    if (newlineIdx === -1) continue;
    const heading = part.slice(0, newlineIdx).trim().toLowerCase();
    const body = part.slice(newlineIdx + 1).trim();
    if (heading.includes('understand')) introMd = body;
    else if (heading.includes('question')) questionsMd = body;
  }

  const blocks = questionsMd.split(/\n(?=\*\*[A-M]\d+\.\s)/);
  const questions = blocks
    .map((b) => b.trim())
    .filter((b) => /^\*\*[A-M]\d+\./.test(b))
    .map(parseQuestionBlock);

  return {
    id: String(data.id ?? ''),
    slug,
    title: String(data.title ?? ''),
    order: Number(data.order ?? 0),
    introHtml: introMd ? String(marked.parse(introMd)) : '',
    questions,
  };
}

let _sectionsByProject: Record<string, Section[]> | null = null;

function loadSections(): Record<string, Section[]> {
  if (_sectionsByProject !== null) return _sectionsByProject;
  const result: Record<string, Section[]> = {};
  for (const [path, raw] of Object.entries(worksheetFiles)) {
    const info = parsePath(path);
    if (!info) continue;
    const section = parseSection(raw, info.slug);
    (result[info.project] ??= []).push(section);
  }
  for (const project in result) {
    result[project].sort((a, b) => a.order - b.order);
  }
  _sectionsByProject = result;
  return result;
}

export function listSections(projectSlug: string): Section[] {
  return loadSections()[projectSlug] ?? [];
}

export function getSection(projectSlug: string, slug: string): Section | null {
  return listSections(projectSlug).find((s) => s.slug === slug) ?? null;
}

export function countQuestions(projectSlug: string): number {
  return listSections(projectSlug).reduce((sum, s) => sum + s.questions.length, 0);
}
