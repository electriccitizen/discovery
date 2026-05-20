#!/usr/bin/env node
// Export the remote 'discovery' D1 database to a timestamped SQL dump.
//
// Usage:
//   node scripts/backup-db.mjs              # writes backups/discovery-YYYY-MM-DDTHH-MM-SSZ.sql
//   node scripts/backup-db.mjs --schema     # schema only (no data rows)
//
// Cloudflare D1 keeps automatic point-in-time backups for 30 days
// (`wrangler d1 time-travel restore`). This script gives us a second line
// of defense: an off-cloud SQL dump we can check into a private backup
// store or just keep on disk. Run before any risky operation (migration,
// mass delete, schema change).

import { execSync } from 'node:child_process';
import { existsSync, mkdirSync } from 'node:fs';
import { resolve, dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { argv, exit } from 'node:process';

const __filename = fileURLToPath(import.meta.url);
const repoRoot = resolve(dirname(__filename), '..');
const backupDir = join(repoRoot, 'backups');

const args = argv.slice(2);
const schemaOnly = args.includes('--schema');

if (!existsSync(backupDir)) {
  mkdirSync(backupDir, { recursive: true });
}

const stamp = new Date().toISOString().replace(/[:.]/g, '-').replace(/Z$/, 'Z');
const tag = schemaOnly ? '-schema' : '';
const outPath = join(backupDir, `discovery${tag}-${stamp}.sql`);

const cmd = [
  'npx',
  'wrangler',
  'd1',
  'export',
  'discovery',
  '--remote',
  `--output=${outPath}`,
  ...(schemaOnly ? ['--no-data'] : []),
].join(' ');

console.log(`→ ${cmd}\n`);

try {
  execSync(cmd, { stdio: 'inherit', cwd: repoRoot });
  console.log(`\n✓ Saved ${outPath}`);
} catch (err) {
  console.error(`✗ Backup failed: ${err.message}`);
  exit(1);
}
