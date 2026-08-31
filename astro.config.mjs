// @ts-check
import { defineConfig } from "astro/config";
import { unified } from "@astrojs/markdown-remark";
import mdx from "@astrojs/mdx";
import sitemap from "@astrojs/sitemap";
import pagefind from "astro-pagefind";

// https://astro.build/config
export default defineConfig({
	site: "https://7tonshark.com",
	// Preserve existing URL shape: /posts/{slug}/
	trailingSlash: "always",
	markdown: {
		// Use the pure-JS remark/rehype (unified) pipeline instead of Astro 7's
		// default Sätteri: satteri@0.10.4 ships no matching native binaries, and
		// unified() gives us the mature remark/rehype plugin ecosystem.
		processor: unified(),
		// Single dark theme — the page is always light, code is always dark.
		shikiConfig: {
			theme: "night-owl",
			wrap: false,
		},
	},
	integrations: [mdx(), sitemap(), pagefind()],
});
