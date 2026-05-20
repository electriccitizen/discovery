#!/usr/bin/env node
// Sync reference docs from a source repo into a project's references/ folder.
//
// Usage:
//   node scripts/sync-references.mjs --project edusa --source ~/projects/edusa/docs
//   node scripts/sync-references.mjs --project edusa --source ~/projects/edusa/docs --dry-run
//
// Reads the project's _meta.json `references` array to know which doc slugs
// to copy. Each ref slug `foo` maps to `<source>/foo.md`. Files that don't
// exist in source are reported (but not fatal). Existing destination files
// are overwritten — this is a one-way sync (source repo → portal). See
// docs/PLAN.md §6.

import { readFileSync, writeFileSync, existsSync, statSync, mkdirSync } from 'node:fs';
import { resolve, dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { homedir } from 'node:os';
import { argv, exit } from 'node:process';

const __filename = fileURLToPath(import.meta.url);
const repoRoot = resolve(dirname(__filename), '..');

function parseArgs(args) {
  const out = { dryRun: false };
  for (let i = 0; i < args.length; i++) {
    const a = args[i];
    if (a === '--project') out.project = args[++i];
    else if (a === '--source') out.source = args[++i];
    else if (a === '--dry-run') out.dryRun = true;
    else if (a === '--help' || a === '-h') out.help = true;
    else {
      console.error(`unknown arg: ${a}`);
      exit(2);
    }
  }
  return out;
}

function expandHome(p) {
  return p.startsWith('~') ? join(homedir(), p.slice(1)) : p;
}

function hashish(s) {
  // Tiny FNV-1a-ish for "did the content change?" — readable, not crypto.
  let h = 0;
  for (let i = 0; i < s.length; i++) h = (h * 33) ^ s.charCodeAt(i);
  return (h >>> 0).toString(16).padStart(8, '0');
}

function main() {
  const args = parseArgs(argv.slice(2));
  if (args.help || !args.project || !args.source) {
    console.log('Usage: node scripts/sync-references.mjs --project <slug> --source <path> [--dry-run]');
    exit(args.help ? 0 : 2);
  }

  const source = resolve(expandHome(args.source));
  const projectDir = resolve(repoRoot, 'content', 'projects', args.project);
  const destDir = join(projectDir, 'references');
  const metaPath = join(projectDir, '_meta.json');

  if (!existsSync(metaPath)) {
    console.error(`no _meta.json at ${metaPath}`);
    exit(1);
  }
  if (!existsSync(source) || !statSync(source).isDirectory()) {
    console.error(`source is not a directory: ${source}`);
    exit(1);
  }

  const meta = JSON.parse(readFileSync(metaPath, 'utf-8'));
  const refs = meta.references ?? [];
  if (refs.length === 0) {
    console.warn(`no references declared in ${metaPath}`);
    return;
  }

  if (!existsSync(destDir)) {
    if (args.dryRun) console.log(`(dry) would mkdir ${destDir}`);
    else mkdirSync(destDir, { recursive: true });
  }

  let copied = 0, unchanged = 0, missing = 0;
  for (const ref of refs) {
    const srcPath = join(source, `${ref.slug}.md`);
    const destPath = join(destDir, `${ref.slug}.md`);

    if (!existsSync(srcPath)) {
      console.warn(`  ⚠ source missing: ${srcPath}`);
      missing++;
      continue;
    }

    const srcContent = readFileSync(srcPath, 'utf-8');
    const destExists = existsSync(destPath);
    const destContent = destExists ? readFileSync(destPath, 'utf-8') : null;

    if (destContent === srcContent) {
      console.log(`  ⏸ unchanged   ${ref.slug}.md`);
      unchanged++;
      continue;
    }

    const action = destExists ? 'update' : 'create';
    const srcHash = hashish(srcContent);
    const destHash = destContent ? hashish(destContent) : '--------';
    console.log(`  ${args.dryRun ? '(dry)' : '✓    '} ${action.padEnd(7)} ${ref.slug}.md  ${destHash} → ${srcHash}`);

    if (!args.dryRun) {
      writeFileSync(destPath, srcContent);
    }
    copied++;
  }

  console.log(`\n${args.dryRun ? '[dry-run] ' : ''}${copied} copied, ${unchanged} unchanged, ${missing} missing in source.`);
}

main();
