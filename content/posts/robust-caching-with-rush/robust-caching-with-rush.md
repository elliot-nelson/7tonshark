---
title: Robust remote caching with Rush
subtitle: Use Rush's remote caching effectively in your CI pipeline.
description: Use Rush's remote caching effectively in your CI pipeline.
tweets: ['1654208667757993985']
date: 2023-05-04
tags: [publish, rushjs, monorepo]
---

As you scale out a new Rush monorepo, one of the first and most important things to get working is your [remote build cache](https://rushjs.io/pages/maintainer/build_cache/) -- without it, build times (both for local developers and your CI system) will quickly become unmanageable.

The official docs describe how to configure the cache, but not necessarily how to _use_ it, which often requires some careful thinking about exactly how your developers and CI pipeline will interact with it. For this guide I'm focusing on how to integrate your build cache into a GitHub Actions pipeline, but the same concepts should work in any CI system.

## Getting started

At this point you probably already have a PR build and a CI (post-merge) build, both of which run `rush test` to run all builds and unit tests. (Or, `rush build`, if you haven't setup phased builds yet.) Typically your CI pipeline will have specific credentials for the cache saved as a secret, and so you'll end up with something like this:

```yaml
# Somewhere in your "pull-request.yaml"
steps:
  - name: 'Rush Build'
    run: |
      node common/scripts/install-run-rush.js test --production --verbose --timeline
    env:
      FORCE_COLOR: 1
      RUSH_BUILD_CACHE_CREDENTIAL: {% raw %}${{ secrets.RUSH_BUILD_CACHE_TOKEN }}{% endraw %}
      RUSH_BUILD_CACHE_WRITE_ALLOWED: 0

# Somewhere in your "push-main.yaml"
steps:
  - name: 'Rush Build'
    run: |
      node common/scripts/install-run-rush.js test --production --verbose --timeline
    env:
      FORCE_COLOR: 1
      RUSH_BUILD_CACHE_CREDENTIAL: {% raw %}${{ secrets.RUSH_BUILD_CACHE_TOKEN }}{% endraw %}
      RUSH_BUILD_CACHE_WRITE_ALLOWED: 1
```

In this configuration, your pull request build can _read_ from the cache (effectively skipping projects that have not changed in the pull request), and your post-merge job will _write_ to the cache (saving the project build outputs to be used by the PR build and by local developers).

## Handling the production flag

In the example above, you'll notice the `--production` flag, which is commonly used in a Rush build to indicate a "CI output" -- for example, your Webpack configuration might use it to indicate you want the cleaned up, minified build, with debugging turned off, etc. Typically developers will _not_ run with this flag, which means that the cache entries saved above won't be hits for local developers.

To fix this issue, you can run a second job in tandem with your first job -- I like to call this job "Warm cache", as its only purpose is to "warm up" the cache for local developers. In your main job, you typically run `rush check` and `rush prettier`, etc.; in this secondary job, you'll skip all that and focus on just building.

```yaml
jobs:
  build:
    name: 'Build'
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
        with:
          lfs: true
          fetch-depth: 0
      - name: Use Node.js
        uses: actions/setup-node@v3
        with:
          node-version-file: '.nvmrc'
      - name: 'Rush Build'
        run: |
          node common/scripts/install-run-rush.js install
          node common/scripts/install-run-rush.js test --production --verbose --timeline
        env:
          FORCE_COLOR: 1
          RUSH_BUILD_CACHE_CREDENTIAL: {% raw %}${{ secrets.RUSH_BUILD_CACHE_TOKEN }}{% endraw %}
          RUSH_BUILD_CACHE_WRITE_ALLOWED: 1

  build-warm-cache:
    name: 'Build - Warm Cache'
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
        with:
          lfs: true
          fetch-depth: 0
      - name: Use Node.js
        uses: actions/setup-node@v3
        with:
          node-version-file: '.nvmrc'
      - name: 'Rush Build'
        run: |
          node common/scripts/install-run-rush.js install
          node common/scripts/install-run-rush.js test --verbose --timeline
        env:
          FORCE_COLOR: 1
          RUSH_BUILD_CACHE_CREDENTIAL: {% raw %}${{ secrets.RUSH_BUILD_CACHE_TOKEN }}{% endraw %}
          RUSH_BUILD_CACHE_WRITE_ALLOWED: 1
```

## Writing to cache from pull requests

As your monorepo continues to scale, you'll run into an issue with the above setup, which boils down to a timing issue.

If your post-merge job is the one writing new entries to the cache, it means that immediately after merging a pull request, cache entries for the modified projects aren't available for some period of time (5-15 minutes, depending on your typical build times). That means any PR builds that run within that time period have to _rebuild_ the projects from the previous change -- and any local developer who happens to pull main and build at that time, will also have to rebuild them.

If your monorepo is merging 5+ PRs an hour, this means that you'll _always_ be rebuilding projects -- developers who take a look at their local builds or their PR builds may start wondering if the cache is working at all, because every time they build one project, it seems to require building a bunch of other projects they didn't change.

The way to fix this problem is to _always write the cache_. Turn on `RUSH_BUILD_CACHE_WRITE_ALLOWED` in your pull request workflow, and make sure your pull request workflow has both a `Build` and a `Build - Warm cache` job. This way, every time a PR merges to main, all of the cache entries for the modified projects are already in the cache. A local developer who pulls latest immediately after a merge and runs `rush test` will see exactly what they expect -- they have no local changes, so everything should immediately pull from cache.

> Taking this step can seem a bit scary, but is totally safe as long as your project builds are deterministic. If some of your projects are not building deterministically, then this is an issue you'll have to solve eventually!

## Handling phased builds properly

Once you're done with the initial configuration changes, enabling [phased builds](https://rushjs.io/pages/maintainer/phased_builds/) is typically pretty simple. However, it's very easy for subtle configuration issues to slip through the cracks. In particular, there are some gaps in your phased build definitions that might be invisible to you until _after_ you enable both remote build caching and pull request cache writes.

This is likely the first time that it's possible, due to overlapping builds, for your CI system to attempt to run phases of a build on different machines. For example, one build may write the cache entry for the `_build` phase of a project, while another machine picks up this cache entry and tries to run the `_test` phase. If there are any gaps in the _build inputs and build outputs_ of your projects, this is where you'll start running into them.

{% image "./remote-cache-run.png", "Overlapping PR builds" %}

A very common example is forgetting to add the `.heft/` folder as a build output for Heft-based projects. For example, in your `rush-project.json`:

```json
{
  "operationSettings": [
    {
      "operationName": "build",
      "outputFolderNames": ["src/generated", "lib", "lib-commonjs", "dist", "temp"]
    },
    {
      "operationName": "_phase:build",
      "outputFolderNames": ["src/generated", "lib", "lib-commonjs", "dist", ".heft"]
    },
    {
      "operationName": "_phase:test",
      "outputFolderNames": ["temp/coverage", "temp/jest-reports"]
    }
  ]
}
```

Because the `heft test` command relies on the output of the `.heft` folder, and `heft build` produces the folder, if you run these two commands in separate phases, you must make sure that the `.heft` folder is listed as a build output (in `outputFolderNames`). For best results, if you have any Heft-based projects, put this in a generic rig in your monorepo.

You may have other such "special folders" in your own repo, so keep on the lookout for these issues as your build caching configuration gets more advanced.

## Using a merge queue

Recently at my company, we've been experimenting with GitHub's new [Merge Queue](https://docs.github.com/en/repositories/configuring-branches-and-merges-in-your-repository/configuring-pull-request-merges/managing-a-merge-queue).

I'll write more about that experience in a future post, but an interesting aspect of the merge queue for caching is that it lives in between a pull request and a post-merge job. You could choose to turn on cache writing _only_ for the `merge_group` event and not the `pull_request` event in your workflow. This would provide a bit of extra protection, because PRs won't enter the merge queue until after all builds are passing green and a coworker has reviewed the changes, _but_, you still get the benefit of having the updated cache entries ready to go when the commit hits the main branch.

If anyone's tried this, I'd be interested in hearing how it went!
