---
title: The "PR Ready" Pattern
subtitle: Delegate ownership of your monorepo's GitHub Actions pull request pipeline.
description: Delegate ownership of your monorepo's GitHub Actions pull request pipeline.
xtweets: ['1609965125053845505']
date: 2023-04-13
tags: [publish2, rushjs2, monorepo2]
---

When you start a new [Rush](https://rushjs.io) monorepo, your pull request pipeline typically starts with just one job -- the one that runs `rush build` (or `rush test`, once you've configured phased builds). Over time, though, you inevitably begin to accumulate other jobs -- tests that run on Mac or Windows, visual regression tests, infrastructure or content deployment planning jobs, etc.

In a typical repo, the easiest way to make new pieces of your pipeline required to merge pull requests is to add them to your repository's _Protected Branches_. As you add new jobs, you add them to the list of required status checks for your `main` branch, which ends up looking something like this:

![GitHub status checks](protected-branch.png)

There are two issues with this approach for a large repo. First, it introduces an invisible dependency between the structure of your pull request workflow and the list of status checks: you can't rename or split up jobs without accidentally breaking status checks, allowing PRs into main that don't belong (or preventing anyone from merging PRs at all). Second, in order to update those status checks, you need admin permissions on the repo -- but typically, you want to be able to delegate permission to maintain pipelines to development teams _without_ giving them admin permissions.

To solve this, we can create a new, _single job_ that exists only to indicate a pull request is ready to merge -- I like to call this job "PR Ready" (`pr-ready` in your YAML workflow). You then make this job depend on all of the other jobs in your workflow that should block merges into `main`.

Here's an example of how to configure this job in your pull request workflow:

```yaml
jobs:
  pr-ready:
    name: PR Ready
    runs-on: ubuntu-latest
    if: success() || failure()
    needs: [build, visual-regression, build-windows]
    env:
      FAILURE: {% raw %}${{ contains(join(needs.*.result, ','), 'failure') }}{% endraw %}
    steps:
      - name: Check for failure
        run: |
          echo $FAILURE
          if [ "$FAILURE" = "false" ]; then
            exit 0
          else
            exit 1
          fi
```

The `if` condition here is important: it _will_ trigger if some of the `needs` dependencies are _skipped_. This is critical, because it allows you to have parts of your workflow that are required if they run, but that can be skipped (if, for example, the relevant projects haven't changed in this pull request). However, it _won't_ trigger if the workflow has been cancelled (also important, otherwise manually cancelling PR runs would allow developers to merge pull requests).

If any of the jobs in your workflow fail, you'll still be able to merge your pull request _unless_ the failing job is in the `needs` list for your PR Ready job. This allows you to introduce new, experimental jobs into the workflow, letting them run on all pull requests but not yet blocking new merges to main. (Although remember that [developers don't like red checks](https://7tonshark.com/posts/avoid-red-checks/), so avoid jobs you know will fail frequently, even if they don't technically block merges.)

Once you introduce the PR Ready job, you can update your required status checks to list only this job.

![GitHub status checks](pr-ready.png)

Now changes to the pull request workflow -- including new jobs, refactored jobs, and additions to the list of blocking jobs for pull requests -- can be fully described in a pull request that changes the workflow, and you can use standard `CODEOWNERS` entries to describe what teams can approve these changes, without relying on repo admin permissions.
