---
title: Templates in ADO vs GHA
date: 2024-01-30
tags: [cicd, github, azure]
---

It's been over a year now since I switched from Azure DevOps to GitHub Actions for our monorepo CI/CD pipelines. For the most part, the two platforms have equivalent features -- not _the same_, but close enough that you can implement a feature you want in either. I think the thing that disappoints me most about GitHub Actions is the lack of real Azure-style "templates".

In GitHub Actions, you have two ways to share snippets between pipelines -- reusable _actions_ and reusable _workflows_.

An action is a series of steps (if it's a composite action), or a concrete action that represents a single step (which might be written in bash, or JavaScript, or Golang, etc.). Actions work well enough, especially now that a reusable action can call other reusable actions. They can be defined within a monorepo, or called from other repos (in fact, this is a better experience than Azure for cross-repo actions, since using "repos as actions" is a key strategy for GitHub). However, actions have some big drawbacks as well: for one, GitHub "collapses" all steps in a multi-step composite action in the run view. When you combine this with GitHub's inability to show logs-already-printed for the currently running step upon load, it makes large reusable actions frustrating to debug and investigate in practice. Also, actions can _only_ represent a series of steps inside a job, making them less flexible than ADO's templates (more on that later).

GitHub also supports reusable _workflows_, which behave similarly except they can define multiple jobs or even job matrices to run, and provide many more security and control features, which is nice if you need to be careful about what secrets or settings they should be able to access in the calling repo. However, today, these workflows have some strict usage limits (20 separate workflow calls total, 4 levels nesting). These limits (along with the 256-node fanout limit for matrix jobs) aren't an issue for most open-source single-project repos, but for large monorepos with many different capabilities, these restrictions force you to constantly question whether a given implementation is feasible or you need to use a different pattern.

But the ins and outs of actions and workflows aren't my biggest gripe about GitHub. My big gripe is the lack of _templates_. In Azure DevOps, a `template:` keyword can be used all over your YAML file. (Not _anywhere_, there are some restrictions what can be templated in Azure as well, but for most users it is virtually anywhere.)

For example, in Azure, I can define a tiny YAML file that looks like this:

```yaml
# Global variables (example)
variables:
  - name: PrimaryNodeVersion
    value: 18
  - name: PrimaryLinuxPool
    value: 'Self-Hosted Linux 2023.09.01'
  - name: PrimaryMacPool
    value: 'Self-Hosted Mac 2023.09.01'
  - name: PrimaryWindowsPool
    value: 'Self-Hosted Windows 2023.09.01'
  - name: FORCE_COLOR
    value: 1
```

Then, in any pipeline, I can _insert_ this file into the top like so:

```yaml
jobs:
  - job: build_xbox
    variables:
      - template: ../global/_variables.yaml
    pool:
      name: ${{ variables.PrimaryWindowsPool }}
```

This allows, for example, defining in a single spot the latest pool name / tag name of your intended runners, or intended toolchain versions, and so on, and updating just one line to adjust all pipelines in the repository. This doesn't exist in GitHub Actions, as reusable actions are too low-level, and reusable workflows are too high-level.

The equivalent of GitHub's reusable actions in Azure would be a template YAML file that defines steps, such as:

```yaml
steps:
  - script: 'node common/scripts/install-run-rush.js prettify --mode=check --base=origin/main'
    displayName: 'Prettier'
  - script: 'node common/scripts/install-run-rush.js install'
    displayName: 'Install'
  - script: 'node common/scripts/install-run-rush.js test'
    displayName: 'Build'
```

Then, once again, you can insert the contents of this file into any pipeline in the desired spot:

```yaml
jobs:
  - job: build_xbox
    steps:
      - checkout: self
      - template: _build.yaml
```

The big advantage Azure has over GitHub in this case is that everything inside the _reusable action_ appears as a single "step" in the calling job in GitHub; in Azure, it still shows each individual step as it is executing. For large reusable actions this becomes very cumbersome... although, if they fixed the "no log history at load time" issue, that would mitigate it somewhat.

It'd be unfair to claim Azure is perfect -- some features (such as the 3 different types of template expressions) have a steep learning curve and are easy to get wrong at first. And, GitHub is definitely "workable" for a monorepo -- at least at our size. However, GitHub's restrictive usage limits and missing features (like templates) prevent it from being great.
