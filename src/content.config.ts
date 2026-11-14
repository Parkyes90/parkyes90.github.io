import { defineCollection } from 'astro:content';
import { glob } from 'astro/loaders';
import { z } from 'astro/zod';

const posts = defineCollection({
  // src/content/posts/ 아래의 Markdown, MDX 파일이 글 하나가 된다.
  // `_`로 시작하는 파일은 무시한다.
  loader: glob({ base: './src/content/posts', pattern: '**/[^_]*.{md,mdx}' }),
  schema: z.object({
    title: z.string(),
    description: z.string(),
    pubDate: z.coerce.date(),
    updatedDate: z.coerce.date().optional(),
    tags: z.array(z.string()).default([]),
    /** true면 개발 서버에서만 보이고 배포본에는 포함되지 않는다. */
    draft: z.boolean().default(false),
  }),
});

export const collections = { posts };
