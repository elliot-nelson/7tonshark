---
title: Organize your GitHub workflows
date: 2024-03-06
tags: [cicd, github]
---

Any large monorepo is bound to eventually have "workflow creep" -- pages and pages of GitHub workflows (one of our monorepo currently has 5 pages before we reach the bottom in the GitHub Actions UI). This is a big problem given the current lack of folder support and workflow ordering features in GitHub -- important, commonly used workflows can fall far below piles of less important testing and schedule workflows.

### The technique

We experimented with all kinds of prefixes -- dots, slashes, unicode emojis, etc. It turns out that really only way to affect GitHub's display order today is through standard ASCII character order (emojis are right out -- they work, and look nice in the UI, but they'll sort to the very bottom of the list which is generally not useful).

The lightbulb moment for us is that GitHub's string display of the workflow name is standard HTML, which means that _spaces_ are squashed -- the name `"Deploy"` and the name `"    Deploy"` look identical in the UI. Since space comes before uppercase characters in standard ASCII order, you can abuse a space character to push a workflow _to the top_ -- and even use multiple spaces to fine-tune the order within that list.

### The order

We did an inventory of all of our workflows and decided they fell into 5 rough categories:

 1. The most important to keep "above the fold" are commonly used, globally applicable manual workflows. Tasks that multiple teams often use like "Create Release Branch" or "Publish Libraries" fall into this group.
 2. The second useful category are "core workflows", things like Pull Requests or Push to Main. You don't typically run these manually, but are often looking at their results, so you want them to be prominent in the list.
 3. The third category is the big sea of random workflows. Some of them are team-owned testing workflows, some are rarely used manual jobs, others may be utility or code generation jobs that are only partially automated. This big category floats in the middle.
 4. Fourth, we have "building blocks" -- files that are reusable workflows (called with `workflow_call`) or remote triggers (called with `repository_dispatch`). We want these to come below the generic list.
 5. And last, temporary workflows, workflows specifically for testing other workflows, and utility workflows used only by the build team. We want these below everything.

Consulting a [simple ASCII table](https://www.asciitable.com/), we decided we'd use the following characters to separate these groups by sort order:

```text
 Group 1 (spaces in front)
(Group 2) (wrapped in parentheses)
Group 3 (normal text)
[group-4] (wrapped in square brackets)
~Group 5 (prefixed with tilde)
```

And, finally, here's an example of how the first page of workflows looks in GitHub's UI:

{% image "./in-ui.png", "Screenshot: Workflows ordered in GitHub UI" %}

Note how the "Deploy" jobs are ordered conceptually (DEV STG PRD) rather than alphabetically (DEV PRD STG) -- to do this, you can take advantage of the tricks above anywhere in the display name. The name values for the Deploy workflows in the screenshot above are defined as follows:

```text
# Extra spaces are invisible in the UI:
" Deploy Project -  DEV"
" Deploy Project -  STG"
" Deploy Project - PRD"
```

### Sandbox

The screenshot above was taken in a small sample repo. You can [click around on the list yourself](https://github.com/elliot-nelson/sample-repo-workflow-order/actions) to see it in your own browser.

### Future-looking

This is probably about as far as this technique can take you. You can use some special characters (`>`, etc.) to add even more fine-grained categories, but the real answer hopefully will be eventual support for sort-ordering using an in-workflow mechanism like `sort-order: 17`. Upvote [request 110799](https://github.com/orgs/community/discussions/110799)!

Better yet would be actual folder support, so we could create team- and category-based folders in the UI and put workflows inside of them. For that, upvote [request 11831](https://github.com/orgs/community/discussions/11831)!
