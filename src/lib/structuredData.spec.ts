import { readdirSync, readFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';
import { KNOWS_ABOUT, OWNER } from './site';
import { homeJsonLd, projectJsonLd, serializeJsonLd } from './structuredData';

const site = new URL('https://example.com');

describe('homeJsonLd', () => {
  const [person, website] = homeJsonLd(site)['@graph'];

  it('describes the owner with their profiles and skills', () => {
    expect(person).toMatchObject({ '@type': 'Person', name: OWNER.name, sameAs: [OWNER.github, OWNER.linkedin] });
    expect(person.knowsAbout).toEqual([...KNOWS_ABOUT]);
  });

  it('links the website to the person by @id', () => {
    expect(website).toMatchObject({ '@type': 'WebSite', author: { '@id': person['@id'] } });
  });
});

describe('projectJsonLd', () => {
  it('points at the repo and credits the same person as the home page', () => {
    const data = projectJsonLd(
      { title: 'Demo', summary: 'A demo.', repo: 'https://github.com/x/demo', stack: ['TypeScript', 'Lit'] },
      new URL('/projects/demo/', site),
      site,
    );
    expect(data).toMatchObject({
      '@type': 'SoftwareSourceCode',
      codeRepository: 'https://github.com/x/demo',
      keywords: 'TypeScript, Lit',
      url: 'https://example.com/projects/demo/',
    });
    expect(data.author['@id']).toBe(homeJsonLd(site)['@graph'][0]['@id']);
  });
});

describe('serializeJsonLd', () => {
  it('escapes "<" so a string like "</script>" can’t end the element', () => {
    const out = serializeJsonLd({ name: '</script><script>alert(1)</script>' });
    expect(out).not.toContain('<');
    expect(JSON.parse(out).name).toBe('</script><script>alert(1)</script>');
  });
});

// Structured data must not claim more than the pages show: every skill appears in some project's
// visible text (title, summary, stack or body) or in the footer.
describe('KNOWS_ABOUT', () => {
  const dir = 'src/content/projects';
  const base = readFileSync('src/layouts/Base.astro', 'utf8');
  const footer = base.slice(base.indexOf('<footer'), base.indexOf('</footer>'));
  const corpus = [...readdirSync(dir).map((f) => readFileSync(`${dir}/${f}`, 'utf8')), footer]
    .join('\n')
    .toLowerCase();
  // The words a skill is recognized by on the page: the part in parentheses if there is one
  // ("Web accessibility (WCAG 2.2)" shows up as "WCAG 2.2"), and singular ("Web Components" as "web component").
  const evidence = (skill: string) =>
    (skill.match(/\(([^)]+)\)/)?.[1] ?? skill).toLowerCase().replace(/s$/, '');

  it.each([...KNOWS_ABOUT])('%s is backed by a project on the site', (skill) => {
    expect(corpus).toContain(evidence(skill));
  });
});
