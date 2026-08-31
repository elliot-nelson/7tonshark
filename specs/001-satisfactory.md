# Spec 001 — Satisfactory "garden" section (evergreen guides)

Status: **notes / not yet implemented**
Context: 7tonshark Astro rebuild

## Problem

Elliot wants to publish Satisfactory content — collections of different building
styles and design suggestions. Unlike blog posts, this content is **living**: it
will be edited and expanded over time, pages will link each other, and it's
organized by topic rather than by publish date.

## Decision: garden, not stream

Treat this as a **separate "evergreen" content collection**, NOT as blog posts.

This is the classic "stream vs. garden" distinction:

- **Stream (existing `posts`)** — dated, written-once, ordered newest-first,
  pushed to RSS. Framed as "written on <date>".
- **Garden (new)** — evergreen, interlinked, continually revised, organized by
  topic, with a "last updated" instead of a publish date.

Why not reuse `posts`:

- Editing a post either re-dates it (misleading) or needs a bolted-on "updated".
- Re-publishing edits would **spam RSS subscribers** on every tweak.
- The chronological `/posts/` archive is the wrong index — a wiki wants a
  **topic hub page** that links its pages, not a reverse-chronological list.
- "Written 2026" framing reads wrong on a living reference.

Authoring stays identical to blog posts: drop a markdown file + co-located
images in a folder, add front matter.

## Proposed shape (to confirm at build time)

### Scope / naming — OPEN

Leaning toward a **general `guides` collection** with Satisfactory as the first
topic (most future-proof; generalizes to other games/topics later):

- Routes: `/guides/` (all topics) → `/guides/satisfactory/` (hub) →
  `/guides/satisfactory/<slug>/` (page)

Alternatives considered:

- Dedicated top-level section: `/satisfactory/<slug>/`
- "notes" / "garden" naming (digital-garden framing) instead of "guides"

### Folder structure

```text
src/content/guides/satisfactory/
  index.md                     ← hub page (links all the others)
  manifold-vs-load-balanced/
    index.md
    manifold.png
  brutalist-factory-facades/
    index.md
```

### Content collection

New collection in `src/content.config.ts`, e.g. `guides`, with a
glob loader over `src/content/guides`.

Front matter schema (draft):

- `title: string`
- `updated: coerce.date()`   ← last-updated, replaces publish `date`
- `topic: string`            ← e.g. "satisfactory" (or derive from folder)
- `summary: string` (optional)
- `order: number` (optional) ← control hub ordering instead of date sort
- `draft: boolean` default false

### Pages / routes to add

- `/guides/index.astro` — lists topics (hub of hubs).
- `/guides/[topic]/index.astro` — topic hub (the "wiki" landing that links all
  pages in the topic). Or author the hub as `index.md` inside the topic folder.
- `/guides/[topic]/[...slug].astro` — renders a guide page. Show "Last updated
  <date>" instead of a publish date. Consider a simple in-page nav / list of
  sibling pages for the interlinked-wiki feel.

### Cross-linking

- Guide pages link each other with relative links.
- A regular blog post can link into the garden if Elliot wants to "announce" it.

### RSS / feeds

- **Exclude `guides` from the blog RSS** (`src/pages/feed/feed.xml.ts` only
  iterates `posts`, so this is already true — just don't add guides to it).
- Optional future: a separate guides feed if desired.

### Design / styling

- Reuse the existing dark-on-light system + `.linklist`/`.postlist` patterns.
- Hub page: grouped/ordered list of pages with short summaries.
- Guide page header: title + "Last updated <date>" in the muted metadata style.

## Not doing yet

- No scaffolding, collection, routes, or nav entry created. This file is the
  design record to implement from later.
