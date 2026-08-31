#!/usr/bin/env node
// Convert an Eleventy post to the Astro content collection.
//
// Usage: node scripts/migrate-post.mjs <slug> [<slug> ...]
//
// - Source: ../content/posts/<slug>/<slug>.md (folder bundle) OR ../content/posts/<slug>.md (loose)
// - Dest:   src/content/posts/<slug>/index.md
// - Rewrites {% image "path", "alt" %} shortcodes to Markdown ![alt](path)
// - Copies all co-located, non-Markdown assets (images, banner.txt, etc.)
// - Front matter is copied verbatim (the collection schema strips unknown keys)

import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const repoRoot = path.resolve(__dirname, "..", "..");
const srcPostsDir = path.join(repoRoot, "content", "posts");
const destPostsDir = path.resolve(__dirname, "..", "src", "content", "posts");

// Matches {% image "src", "alt" %} with optional trailing args. Uses
// backreferences so quotes inside a value (e.g. Necromancer's) don't terminate early.
const IMAGE_SHORTCODE =
	/\{%\s*image\s+(["'])(.*?)\1\s*,\s*(["'])(.*?)\3(?:\s*,[^%]*?)?\s*%\}/g;

function resolveSource(slug) {
	const folder = path.join(srcPostsDir, slug);
	const folderMd = path.join(folder, `${slug}.md`);
	if (fs.existsSync(folderMd)) return { md: folderMd, assetsDir: folder };
	const loose = path.join(srcPostsDir, `${slug}.md`);
	if (fs.existsSync(loose)) return { md: loose, assetsDir: null };
	throw new Error(`No source markdown found for "${slug}"`);
}

function migrate(slug) {
	const { md, assetsDir } = resolveSource(slug);
	const raw = fs.readFileSync(md, "utf8");

	let shortcodeCount = 0;
	let converted = raw.replace(
		IMAGE_SHORTCODE,
		(_m, _q1, src, _q2, alt) => {
			shortcodeCount++;
			return `![${alt}](${src})`;
		},
	);

	// Drop Nunjucks {% raw %}/{% endraw %} guards — Astro .md doesn't process
	// templates, so ${{ ... }} is already literal. Remove full-line guards first
	// (whole line), then any remaining inline guards (token only).
	converted = converted
		.replace(/^[ \t]*\{%-?\s*(?:raw|endraw)\s*-?%\}[ \t]*\r?\n/gm, "")
		.replace(/\{%-?\s*(?:raw|endraw)\s*-?%\}/g, "");

	if (/\{%/.test(converted)) {
		console.warn(`  ⚠ ${slug}: leftover Liquid tag(s) — needs manual review`);
	}

	const destDir = path.join(destPostsDir, slug);
	fs.mkdirSync(destDir, { recursive: true });
	fs.writeFileSync(path.join(destDir, "index.md"), converted);

	let assetCount = 0;
	if (assetsDir) {
		for (const entry of fs.readdirSync(assetsDir)) {
			if (entry.endsWith(".md")) continue;
			const from = path.join(assetsDir, entry);
			if (!fs.statSync(from).isFile()) continue;
			fs.copyFileSync(from, path.join(destDir, entry));
			assetCount++;
		}
	}

	console.log(
		`  ✓ ${slug} (images: ${shortcodeCount}, assets copied: ${assetCount})`,
	);
}

const slugs = process.argv.slice(2);
if (slugs.length === 0) {
	console.error("Usage: node scripts/migrate-post.mjs <slug> [<slug> ...]");
	process.exit(1);
}
console.log(`Migrating ${slugs.length} post(s):`);
for (const slug of slugs) {
	try {
		migrate(slug);
	} catch (err) {
		console.error(`  ✗ ${slug}: ${err.message}`);
	}
}
