import { defineCollection } from 'astro:content';
import { glob } from 'astro/loaders';
import { z } from 'astro/zod';

const projects = defineCollection({
  loader: glob({ pattern: '**/*.md', base: './src/content/projects' }),
  schema: ({ image }) =>
    z
      .object({
        title: z.string(),
        summary: z.string(),
        repo: z.url(),
        stack: z.array(z.string()),
        status: z.enum(['active', 'paused', 'experiment', 'done']),
        // Relative path to a screenshot in src/assets/projects/, e.g. ../../assets/projects/smackhem.png.
        // Astro resizes it and serves WebP. 16:10 crops look best.
        image: image().optional(),
        // What the screenshot shows, for screen readers and when it fails to load. Required with `image`.
        // Describe the content in a sentence; skip "image of", and the project name if the page already says it.
        imageAlt: z.string().min(1).optional(),
        // Lower numbers show first on the home page.
        order: z.number().default(100),
        // An older version's screenshot, shown at the end of the visible page as "Before: …" for comparison.
        beforeImage: image().optional(),
        // What the older screenshot shows. Required with `beforeImage`, like imageAlt.
        beforeImageAlt: z.string().min(1).optional(),
        // The caption under it, e.g. "The 2023 version."
        beforeCaption: z.string().min(1).optional(),
      })
      .refine((d) => !d.image || d.imageAlt, {
        message: 'imageAlt is required when image is set',
        path: ['imageAlt'],
      })
      .refine((d) => !d.beforeImage || (d.beforeImageAlt && d.beforeCaption), {
        message: 'beforeImageAlt and beforeCaption are required when beforeImage is set',
        path: ['beforeImageAlt'],
      }),
});

export const collections = { projects };
