// /llms.txt: a Markdown summary of the site for AI assistants, following the llmstxt.org proposal
// (an H1, a short summary as a blockquote, then sections of links). Built from the project collection,
// so it can't drift from the pages. See docs/performance-seo.md#llmstxt.

import { OWNER, SITE_DESCRIPTION, STATUS_LABEL } from './site';

export interface ProjectEntry {
  id: string;
  title: string;
  summary: string;
  repo: string;
  status: keyof typeof STATUS_LABEL;
  order: number;
}

/** Each project is one list item, so its text has to stay on one line. */
const oneLine = (s: string) => s.replace(/\s+/g, ' ').trim();

export function buildLlmsTxt(projects: readonly ProjectEntry[], site: URL): string {
  const sorted = [...projects].sort((a, b) => a.order - b.order);
  const projectLines = sorted.map((p) => {
    const page = new URL(`/projects/${p.id}/`, site).href;
    return `- [${oneLine(p.title)}](${page}): ${oneLine(p.summary)} Status: ${STATUS_LABEL[p.status]}. Code: ${p.repo}`;
  });
  return [
    `# ${OWNER.name}`,
    '',
    `> ${SITE_DESCRIPTION}`,
    '',
    `${OWNER.name} is a ${OWNER.jobTitle.toLowerCase()}. Each project page below covers what was built, how it was checked, and where it stands.`,
    '',
    '## Projects',
    '',
    ...projectLines,
    '',
    '## Contact and profiles',
    '',
    `- Email: [${OWNER.email}](mailto:${OWNER.email})`,
    `- [GitHub](${OWNER.github})`,
    `- [LinkedIn](${OWNER.linkedin})`,
    '',
  ].join('\n');
}
