# 7tonshark.com

The personal website of Elliot Nelson — [7tonshark.com](https://7tonshark.com).
A minimal, dark-on-light blog built with [Astro](https://astro.build/).

## Stack

- **Astro 7** — static site generation, content collections, `astro:assets` image optimization.
- **Markdown posts** — one folder per post under `src/content/posts/<slug>/`, with co-located images. See `src/content.config.ts` for the front matter schema.
- **Shiki** (`night-owl`) — syntax highlighting for code blocks.
- **Pagefind** — static search index built at deploy time.
- **Geist Sans / Geist Mono** — typography.
- Custom CSS (no framework) in `src/styles/global.css`.

## Commands

All commands are run from the root of the project:

| Command           | Action                                             |
| :---------------- | :------------------------------------------------- |
| `npm install`     | Install dependencies                               |
| `npm run dev`     | Start the local dev server (drafts are visible)    |
| `npm run build`   | Type-check (`astro check`) and build to `./dist/`  |
| `npm run preview` | Preview the production build locally               |

Use the Node version pinned in `.nvmrc` (`nvm use`).

## Writing a post

Create `src/content/posts/<slug>/index.md` with front matter:

```yaml
---
title: My post
date: 2026-01-01
tags: [dev]
description: One-line summary used in listings and the RSS feed.
draft: true # optional — visible in `npm run dev`, excluded from production builds
---
```

Drop any images alongside `index.md` and reference them with relative
Markdown (`![alt](./image.png)`); Astro optimizes them automatically.

## Deployment

Deployed on Netlify (see `netlify.toml`): `npm run build` → publish `dist/`.
