// schema.org JSON-LD: who the site is about (home page) and what each project is (project pages).
// It only restates what the pages show. See docs/performance-seo.md#structured-data.

import { KNOWS_ABOUT, OWNER } from './site';

/** The fields of a project that its structured data needs, from the content collection. */
export interface ProjectFacts {
  title: string;
  summary: string;
  repo: string;
  stack: readonly string[];
}

const personId = (site: URL) => `${new URL('/', site)}#clark`;

/** The home page: the Person, with skills and profiles, and the WebSite they author. */
export function homeJsonLd(site: URL) {
  return {
    '@context': 'https://schema.org',
    '@graph': [
      {
        '@type': 'Person',
        '@id': personId(site),
        name: OWNER.name,
        jobTitle: OWNER.jobTitle,
        url: new URL('/', site).href,
        sameAs: [OWNER.github, OWNER.linkedin],
        knowsAbout: [...KNOWS_ABOUT],
      },
      {
        '@type': 'WebSite',
        name: OWNER.name,
        url: new URL('/', site).href,
        author: { '@id': personId(site) },
      },
    ],
  };
}

/** A project page: the code, where it lives, what it's built with, and who wrote it. */
export function projectJsonLd(project: ProjectFacts, pageUrl: URL, site: URL) {
  return {
    '@context': 'https://schema.org',
    '@type': 'SoftwareSourceCode',
    name: project.title,
    description: project.summary,
    url: pageUrl.href,
    codeRepository: project.repo,
    keywords: project.stack.join(', '),
    author: { '@type': 'Person', '@id': personId(site), name: OWNER.name, url: new URL('/', site).href },
  };
}

/** JSON for a <script type="application/ld+json">, with "<" escaped so no string can close the element early. */
export const serializeJsonLd = (data: unknown) => JSON.stringify(data).replace(/</g, '\\u003c');
