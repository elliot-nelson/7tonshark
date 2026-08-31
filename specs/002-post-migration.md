# Spec 002 — Post migration tracker (Eleventy → Astro)

Status: **complete** — 44 / 44 published posts converted (full `astro build` passes)

Converter: `scripts/migrate-post.mjs <slug> [<slug> ...]`
(rewrites `{% image %}` → `![]()`, copies co-located assets, front matter copied
verbatim since the collection schema strips unknown keys).

## Known follow-ups

None outstanding — all migration items spot-checked and resolved.

Resolved:

- **Animated GIFs**: spot-checked in browser — animation survives (2026-08-25).
  No global fix needed.
- **Interactive posts** converted: runtime assets moved to
  `public/posts/<slug>/` so relative URLs resolve. `simple-interactive-music-soundbox`
  keeps inline `<script>` + external `.js` (pass through in Astro `.md`);
  `pixel-art-canvas-resize` demo pages (`example*.html`) were de-Eleventy'd
  (front matter stripped, `{% imageUrl %}` → `grid.png`) and served from `public`.
  Browser click-test passed — audio playback and canvas demos work (2026-08-25).

- `{% raw %}`/`{% endraw %}` guards (both full-line and inline) are now stripped
  automatically by the converter; inner `${{ ... }}` content is preserved.
- Bad date `why-nioh-2-is-so-good` `2024-04-31` → fixed to `2024-04-30`.

## Published posts (44) — newest first

- [x] `pixel-art-looking-at-objects` — Pixel Art: Looking at Objects (2026-07-11)
- [x] `product-ai-dead-end` — Is Product AI a dead end? (2026-03-23)
- [x] `compliance` — Compliance (2026-02-24)
- [x] `claude-adr-pattern` — The ADR Pattern for Claude (2026-01-03)
- [x] `terraform-backend-config-yaml` — Keeping Terraform Config in YAML (2025-11-04)
- [x] `making-of-js13k-2025-ashes-of-ulthar` — js13k 2025 Postmortem (2025-10-11) ⚠ animated gifs
- [x] `integration-testing-llm-prompts` — Integration Testing LLM Prompts (2025-08-19)
- [x] `prompt-engineering-artisanal-coding` — Is prompt engineering the new artisanal coding? (2025-07-27)
- [x] `ai-assistants-mental-fatigue` — AI Assistants & Mental Fatigue (2025-07-11)
- [x] `true-scalability-delegation` — True Scalability & Responsibility with AI (2025-07-04)
- [x] `copilot-recipe-loader` — Copilot: A cascading recipe loader (2025-06-30)
- [x] `parallelism-with-semaphores-in-bash` — Parallelism with Semaphores in Bash (2024-09-26)
- [x] `dynamic-github-actions-shell` — Faking a dynamic GitHub Actions "shell" property (2024-08-19)
- [x] `reviewing-monorepo-prs` — Reviewing PRs in a Monorepo (2024-08-07)
- [x] `lint-rules-for-engineers` — Lint rules should help engineers, not just programmers (2024-07-16)
- [x] `github-maven-jfrog-mirror` — Mirroring a Maven GitHub Package in jFrog (2024-07-02)
- [x] `why-nioh-2-is-so-good` — Why is Nioh 2 so good? (2024-04-30, was bad date 04-31)
- [x] `organize-github-workflows` — Organize your GitHub workflows (2024-03-06)
- [x] `terraform-api-gateway` — Moving from API Gateway v2 to API Gateway v1 (2024-02-19)
- [x] `templates-gha-vs-ado` — Templates in ADO vs GHA (2024-01-30)
- [x] `terraform-dynamic-data-lookups` — Dynamic Data Lookups in Terraform (2024-01-16)
- [x] `github-actions-string-operations` — String Operations in GitHub Actions (2024-01-10)
- [x] `yet-another-redesign` — Yet Another Redesign (2023-12-16)
- [x] `making-of-js13k-2023-harold-is-heavy` — js13k 2023 Postmortem (2023-09-16) ⚠ animated gif
- [x] `handling-generated-code-in-rush` — Handling generated code in Rush (2023-07-19)
- [x] `windows-users` — Windows users (2023-07-11)
- [x] `rushjs-merge-queue` — 30 Days of Merge Queue (2023-05-25)
- [x] `robust-caching-with-rush` — Robust remote caching with Rush (2023-05-04)
- [x] `github-actions-ternary-operator` — Ternary Operators in GitHub Actions (2023-04-28)
- [x] `pr-ready` — The "PR Ready" Pattern (2023-04-20)
- [x] `python-on-new-macs` — Enabling Python on new Macs (2023-01-03)
- [x] `checkout-github-prs` — Checking out fork branches (2022-12-08)
- [x] `ssh-vs-https-in-rush-json` — SSH vs HTTPS URLs in Rush config files (2022-11-17)
- [x] `avoid-conflicts-in-pnpm-lock` — Avoid lockfile conflicts in Rush (2022-10-25)
- [x] `simple-interactive-music-soundbox` — Simple interactive music with SoundBox (2022-10-17) ⚠ interactive/JS
- [x] `making-of-js13k-2022-moth` — js13k 2022 Postmortem (2022-09-17)
- [x] `monorepo-principles` — Three facets of a successful monorepo (2022-07-29)
- [x] `azure-ternary-operator` — Ternary Operators in Azure DevOps (2022-06-21)
- [x] `aws-cdk-asg-termination-lambda` — Custom Termination Policy w/CDK (2022-06-07)
- [x] `inline-node-scripts` — Inline Node Scripts (2022-03-15)
- [x] `avoid-red-checks` — Avoid Red Checks (2022-03-08)
- [x] `line-continuation-characters` — Line \ Continuation (2022-03-01)
- [x] `making-vs-maintaining` — Making vs Maintaining (2021-01-10)
- [x] `pixel-art-canvas-resize` — Scaling a pixel art game for the browser (2020-11-08) ⚠ interactive/HTML+JS

## Drafts (13) — not published on live site, migrate later if desired

`firstpost`, `secondpost`, `thirdpost`, `fourthpost`, `fifthpost` (starter
placeholders — probably drop), `illusion-of-internal-platforms`, `illusion2`,
`monorepo-frog`, `nioh-2`, `thymesia`, `lies-of-p`, `lies-of-p-golden-lie-guide`,
`3-legged-stool`.
