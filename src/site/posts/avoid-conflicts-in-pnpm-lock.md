---
title: Avoid lockfile conflicts in Rush
subtitle: Fix pnpm-lock conflicts forever in your Rush monorepo.
description: Fix pnpm-lock conflicts forever in your Rush monorepo.
tweets: ['1585063310441197568']
tags: [publish, rushjs, monorepo]
date: 2022-10-25
---

If you're running a [Rush monorepo](https://rushjs.io/), having developers run into _lockfile conflicts_ can be a huge drag on productivity. In this post I'll explain some of the issues that arise around lockfile conflicts, and then give a solution that fixes them all.

## Problem: the corrupted lockfile

A corrupted lockfile is bad. **Really** bad.

The worst-case scenario is something like this:

 - A developer notices they have conflicts in a pull request.
 - To fix it, they merge changes locally, resulting in a couple conflicted files, which they fix.
 - The lockfile is also conflicted, but it looks real messy, so to fix it they decide to run `rush update`.

Oops! That was a big mistake... the lockfile had _conflicts in it_, something like this:

```yaml
   redis: ~4.3.1
      typescript: ~4.6.4
    dependencies:
<<<<<<< HEAD
      fastify: 3.25.3
=======
      redis: 4.3.1
>>>>>>> jjansen/oops
    devDependencies:
      '@hbo/eslint-config-codex': link:../eslint-config-codex
      '@rushstack/heft': 0.45.5
      '@types/heft-jest': 1.0.
```

This is a corrupted lockfile, and instead of doing the expected update, your entire node_modules gets blown away and rebuilt, wasting possibly 30+ minutes of the developer's time.

But it's actually worse than that... because the lockfile was corrupted, _all_ of its data was lost, which means the developer has performed a `rush update --full` without realizing it. Every package in the repo has been updated to the highest version matching the source specifiers, possibly resulting in a slew of new, unexpected problems, in projects the developer has never heard of.

If they're lucky, they now realize their mistake and start over. If not, the next day might be wasted trying to understand why unrelated unit tests aren't passing, and why their previously simple PR now has thousands of lines of lockfile changes.

## The traditional fix...

To help developers avoid a waste of time like the above, the traditional fix is to order git not to merge the lockfile at all.

In your `.gitattributes`, that looks like this:

```text
pnpm-lock.yaml               merge=binary
```

Now when the developer does a local merge with conflicts and runs `rush update`, they are safe -- by default they have their copy of the lockfile, plus the changes they just fixed up in a presumably conflicted `package.json` file, and `rush update` will only touch a few lines, as expected.

## ...and the resulting problem

This fix has a big downside.

Back when your lockfile merged as text, if developers updated two different `package.json` in different branches, this resulted in modified lines in the lockfile in separate places, and GitHub happily performed an automatic merge. As long as two different developers didn't make conflicting changes in the same `package.json` file, they generally didn't have merge conflicts in the lockfile.

Now, _every_ time _any_ team changes a `package.json` file, _all_ other PRs that change `package.json` files are conflicted!

We've saved developers from the worst of the lockfile conflict issues, but now we're forcing them to fix a conflict every other pull request.

The cure might be worse than the disease in this case.

## The real solution: the "ours" merge driver

What we really need is a way to allow GitHub to resolve merge conflicts automatically whenever it can (like when the file is treated as text), but _not_ to have developers end up with a corrupted lockfile when they merge locally (like when the file is treated as binary).

The "ours" merge driver does exactly this! For this specific file, _if and only if_ it would have been conflicted, it will take "ours" (as if you passed `--ours` to git merge). If the file wasn't conflicted, it will still merge sections from both branches like a typical text merge.

Here's what it looks like in your `.gitattributes`:

```text
pnpm-lock.yaml               merge=ours
```

Now, there's one additional wrinkle here -- the "ours" merge driver is only available if your developers have explicitly enabled it on their local machines. Typically you want to add this to your "setup" script, whatever you suggest to developers to run locally -- for example, `common/scripts/setup.sh`.

Add this line to the script to automatically enable the driver:

```bash
git config merge.ours.driver true
```

> If you don't have any setup script at all in your repo, this might be the time to create one. Alternatively, you can try tucking this line into a post-checkout git hook. In a Rush repo, you can create the file `common/git-hooks/post-checkout` and add the line there.

## The end result

After making the changes above, developers in your repo should get "best of both worlds" behavior:

 * If two developers change two different projects, the lockfile should never have a conflict and both PRs can merge in sequence without issue.

 * If two developers change the same project (adding dependencies for example), then it _is_ possible they'll get a lockfile conflict -- but the second developer can merge locally as normal, run a `rush update`, and merge the PR without issue.
