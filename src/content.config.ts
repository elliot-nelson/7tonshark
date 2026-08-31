import { defineCollection, z } from "astro:content";
import { glob } from "astro/loaders";

const posts = defineCollection({
	// Folder-per-post: src/content/posts/<slug>/index.md (+ co-located images)
	// Loose src/content/posts/<slug>.md also works.
	loader: glob({ pattern: "**/*.{md,mdx}", base: "./src/content/posts" }),
	schema: () =>
		z.object({
			title: z.string(),
			date: z.coerce.date(),
			tags: z.array(z.string()).default([]),
			description: z.string().optional(),
			cardImage: z.string().optional(),
			draft: z.boolean().default(false),
		}),
});

export const collections = { posts };
