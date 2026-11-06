import { defineCollection, z } from 'astro:content';
import { glob } from 'astro/loaders';

const blog = defineCollection({
	loader: glob({ pattern: '**/*.md', base: './src/content/blog' }),
	schema: z.object({
		title: z.string().default(''),
		description: z.string().default(''),
		pubDate: z.coerce.date().default(new Date('1970-01-01')),
		updatedDate: z.coerce.date().optional(),
		tags: z.array(z.string()).default([]),
		cover: z.string().optional(),
		attachments: z.array(z.object({ name: z.string().default('PDF 附件'), file: z.string() })).default([]),
		draft: z.boolean().default(false),
	}),
});

const projects = defineCollection({
	loader: glob({ pattern: '**/*.md', base: './src/content/projects' }),
	schema: z.object({
		lang: z.enum(['zh', 'en']).default('zh'),
		title: z.string(),
		description: z.string(),
		date: z.coerce.date(),
		tags: z.array(z.string()).default([]),
		role: z.string(),
		url: z.preprocess((value) => value === '' ? undefined : value, z.string().url().optional()),
		repo: z.preprocess((value) => value === '' ? undefined : value, z.string().url().optional()),
		featured: z.boolean().default(false),
		attachments: z.array(z.object({ name: z.string().default('PDF 附件'), file: z.string() })).default([]),
	}),
});

const moments = defineCollection({
	loader: glob({ pattern: '**/*.md', base: './src/content/moments' }),
	schema: z.object({
		title: z.string().default(''),
		pubDate: z.coerce.date(),
		images: z.array(z.object({ src: z.string(), alt: z.string().default('') })).default([]),
		tags: z.array(z.string()).default([]),
		draft: z.boolean().default(false),
	}),
});

export const collections = { blog, projects, moments };
