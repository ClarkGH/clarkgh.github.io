// /llms.txt, built from the project collection. What's in it lives in src/lib/llmsTxt.ts.
import type { APIRoute } from 'astro';
import { getCollection } from 'astro:content';
import { buildLlmsTxt } from '../lib/llmsTxt';

export const GET: APIRoute = async ({ site }) => {
  if (!site) throw new Error('llms.txt needs `site` set in astro.config.mjs');
  const projects = await getCollection('projects');
  const text = buildLlmsTxt(
    projects.map((p) => ({ id: p.id, ...p.data })),
    site,
  );
  return new Response(text, { headers: { 'Content-Type': 'text/plain; charset=utf-8' } });
};
