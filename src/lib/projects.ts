import { marked } from 'marked';

export interface ProjectMeta {
  slug: string;
  title: string;
  client: { name: string; label: string; primary_contact: string };
  ec_team: string[];
  client_emails: string[];
  client_email_domains?: string[];
  status: string;
  section_order: string[];
  references: { slug: string; title: string }[];
}

export interface ReferenceDoc {
  slug: string;
  title: string;
  html: string;
}

interface ProjectIndexEntry {
  slug: string;
  active?: boolean;
}

interface ProjectIndex {
  projects: ProjectIndexEntry[];
}

const indexFiles = import.meta.glob<{ default: ProjectIndex }>(
  '/content/projects/_index.json',
  { eager: true }
);

const metaFiles = import.meta.glob<{ default: ProjectMeta }>(
  '/content/projects/*/_meta.json',
  { eager: true }
);

const referenceFiles = import.meta.glob<string>(
  '/content/projects/*/references/*.md',
  { query: '?raw', import: 'default', eager: true }
);

const introFiles = import.meta.glob<string>(
  '/content/projects/*/_intro.md',
  { query: '?raw', import: 'default', eager: true }
);

function metaProjectFromPath(path: string): string | null {
  return path.match(/\/content\/projects\/([^/]+)\/_meta\.json$/)?.[1] ?? null;
}

function refPathInfo(path: string): { project: string; slug: string } | null {
  const m = path.match(/\/content\/projects\/([^/]+)\/references\/([^/]+)\.md$/);
  return m ? { project: m[1], slug: m[2] } : null;
}

export function listProjects(): ProjectIndexEntry[] {
  const firstKey = Object.keys(indexFiles)[0];
  if (!firstKey) return [];
  const list = indexFiles[firstKey].default.projects ?? [];
  return list.filter(
    (p) =>
      p.active !== false &&
      Object.keys(metaFiles).some((k) => metaProjectFromPath(k) === p.slug)
  );
}

export function getProject(slug: string): ProjectMeta | null {
  for (const [path, mod] of Object.entries(metaFiles)) {
    if (metaProjectFromPath(path) === slug) return mod.default;
  }
  return null;
}

export function getIntroHtml(projectSlug: string): string | null {
  for (const [path, raw] of Object.entries(introFiles)) {
    const m = path.match(/\/content\/projects\/([^/]+)\/_intro\.md$/);
    if (m?.[1] === projectSlug) {
      return String(marked.parse(raw));
    }
  }
  return null;
}

export function getReference(projectSlug: string, refSlug: string): ReferenceDoc | null {
  for (const [path, raw] of Object.entries(referenceFiles)) {
    const info = refPathInfo(path);
    if (!info || info.project !== projectSlug || info.slug !== refSlug) continue;
    const project = getProject(projectSlug);
    const meta = project?.references.find((r) => r.slug === refSlug);
    return {
      slug: refSlug,
      title: meta?.title ?? refSlug,
      html: String(marked.parse(raw)),
    };
  }
  return null;
}
