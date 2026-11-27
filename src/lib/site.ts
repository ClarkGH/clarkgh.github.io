// Facts about the site and its owner, shared by the <head>, the structured data and /llms.txt.

export const OWNER = {
  name: 'Clark Hinchcliff',
  jobTitle: 'Frontend Engineer',
  email: 'clarkhinchcliff@gmail.com',
  github: 'https://github.com/ClarkGH',
  linkedin: 'https://www.linkedin.com/in/clarkgh/',
} as const;

/** How each project status reads on the page and in /llms.txt. */
export const STATUS_LABEL = {
  active: 'Active',
  paused: 'Paused',
  experiment: 'Experiment',
  done: 'Done',
} as const;

export const SITE_DESCRIPTION =
  'Clark Hinchcliff, a frontend engineer, and the projects he’s been building and learning from.';

/**
 * Skills for the Person structured data. Each one has to be visible on the site (a project page,
 * or the footer); the structured data repeats the page for machines, it never adds claims of its own.
 */
export const KNOWS_ABOUT = [
  'TypeScript',
  'JavaScript',
  'Web accessibility (WCAG 2.2)',
  'Vue',
  'Nuxt',
  'React',
  'Next.js',
  'Astro',
  'Lit',
  'Web Components',
  'WebGL',
  'Node.js',
  'Java',
  'Spring Boot',
  'MongoDB Vector Search',
  'Retrieval-augmented generation (RAG)',
  'Model Context Protocol (MCP)',
] as const;
