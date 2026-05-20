#!/usr/bin/env node
// Pre-build step: walk every worksheet markdown file under
// /content/projects/*/worksheet/, pull out (project, question_id, title,
// section_id, section_title, section_slug), and emit cron/questions.json
// so the digest worker can enrich emails with real question titles and
// deep links (instead of bare "A1"-style IDs that mean nothing to a
// client reading the email).
//
// Run before `wrangler deploy` whenever the worksheet content changes.

import { readFileSync, readdirSync, writeFileSync } from 'node:fs';
import { resolve, dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const HERE = dirname(fileURLToPath(import.meta.url));
const REPO_ROOT = resolve(HERE, '..');
const CONTENT_DIR = join(REPO_ROOT, 'content', 'projects');

function parseFrontmatter(raw) {
  if (!raw.startsWith('---')) return { data: {}, content: raw };
  const end = raw.indexOf('\n---', 3);
  if (end === -1) return { data: {}, content: raw };
  const fmBody = raw.slice(3, end).trim();
  const content = raw.slice(end + 4).replace(/^\n/, '');
  const data = {};
  for (const line of fmBody.split('\n')) {
    const m = line.match(/^(\w+):\s*(.+)$/);
    if (!m) continue;
    let value = m[2].trim();
    // Strip surrounding quotes if present.
    if ((value.startsWith('"') && value.endsWith('"')) || (value.startsWith("'") && value.endsWith("'"))) {
      value = value.slice(1, -1);
    }
    data[m[1]] = value;
  }
  return { data, content };
}

function parseSection(raw) {
  const { data, content } = parseFrontmatter(raw);

  // Find the "Questions for you" sub-section, then split on bold question
  // headers. Mirrors what src/lib/worksheet.ts does.
  const parts = content.split(/^### /m);
  let questionsMd = '';
  for (const part of parts.slice(1)) {
    const newlineIdx = part.indexOf('\n');
    if (newlineIdx === -1) continue;
    const heading = part.slice(0, newlineIdx).trim().toLowerCase();
    const body = part.slice(newlineIdx + 1).trim();
    if (heading.includes('question')) {
      questionsMd = body;
      break;
    }
  }

  const blocks = questionsMd.split(/\n(?=\*\*[A-M]\d+\.\s)/);
  const questions = [];
  for (const block of blocks) {
    const trimmed = block.trim();
    const m = trimmed.match(/^\*\*([A-M]\d+)\.\s+(.+?)\*\*/);
    if (!m) continue;
    questions.push({ id: m[1], title: m[2].trim() });
  }

  return {
    sectionId: data.id || '',
    sectionTitle: data.title || '',
    order: Number(data.order || 0),
    questions,
  };
}

function buildForProject(projectSlug) {
  const worksheetDir = join(CONTENT_DIR, projectSlug, 'worksheet');
  let files;
  try {
    files = readdirSync(worksheetDir).filter((f) => f.endsWith('.md'));
  } catch {
    return null;
  }

  const out = {};
  for (const file of files) {
    const slug = file.replace(/\.md$/, '');
    const raw = readFileSync(join(worksheetDir, file), 'utf8');
    const section = parseSection(raw);
    for (const q of section.questions) {
      out[q.id] = {
        title: q.title,
        sectionId: section.sectionId,
        sectionTitle: section.sectionTitle,
        sectionSlug: slug,
      };
    }
  }
  return out;
}

function main() {
  const projects = readdirSync(CONTENT_DIR, { withFileTypes: true })
    .filter((d) => d.isDirectory())
    .map((d) => d.name);

  const all = {};
  for (const p of projects) {
    const data = buildForProject(p);
    if (data && Object.keys(data).length > 0) {
      all[p] = data;
    }
  }

  const outPath = join(HERE, 'questions.json');
  writeFileSync(outPath, JSON.stringify(all, null, 2) + '\n');
  const totalQ = Object.values(all).reduce((sum, p) => sum + Object.keys(p).length, 0);
  console.log(`Wrote ${outPath} (${Object.keys(all).length} project(s), ${totalQ} question(s))`);
}

main();
