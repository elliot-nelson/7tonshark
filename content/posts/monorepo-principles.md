---
title: Three facets of a successful monorepo
subtitle: Exploring collocation, coherence, and standardization.
description: Exploring collocation, coherence, and standardization.
tweets: ["1539342191415508993"]
date: 2022-07-29
tags: [monorepo, musings]
---

I've been thinking about monorepos a lot recently, from a general, high-level perspective. Certain goals and concepts come up frequently no matter what type of monorepo you're managing, and I thought I'd jot some of them down.

In my opinion, there are _three key facets_ to a successful monorepo: collocation, coherence, and standardization. Once combined, these facets provide a support structure that allows your developers to adopt a monorepo _mindset_. This mindset is a way of working that a monorepo both encourages and rewards: making small, focused, pull requests, paying costs for changes up front, having each change pay for itself, and so on.

The real, tangible benefit of a monorepo -- a shared codebase where many engineers can quickly and safely make code changes that touch multiple areas of code -- evolves due to this mindset.

To recap: the company wants a codebase where developers can write high-quality software quickly, and at scale; one way to accomplish this is by teaching all of the teams involved to adopt a monorepo _mindset_, which is a set of _principles_ that depend on these _three facets_ of a monorepo. So let's talk about those facets in more detail.

## Collocation

_Collocation_ is the most obvious facet of a monorepo -- code being "collocated" is really just all of your code being together in one repo. If you don't have collocation, then you don't have a monorepo.

I like to include in this definition that the code is also _intentionally organized_. Your monorepo may contain hundreds of different projects maintained by dozens of different teams, some of which have never heard of each other. It's important that all projects are organized in a way that is both _discoverable_ and _intuitive_ to all of the engineers participating.

There are two litmus tests you can use here:

- If I'm browsing the monorepo for a project, and I know generally what it is but don't quite remember the name, can I find it in the first place I look for it? If so, it's discoverable!

- If I'm adding a new project to the monorepo, is it immediately obvious to me what folder it should live in? If so, it's intuitive!

## Coherence

_Coherence_ is a bit more complex than collocation. When a codebase is "coherent", it means that the code _moves together_ and has a single _source of truth_. Successful coherence usually involves trunk-based development, with a single branch (such as `main`) being the only accepted branch -- discouraging long running feature branches or "develop" branches can help ensure a strong source of truth branch.

Another important aspect of coherence is preventing version "pinning" (that is, out-of-commit consumption): if two libraries live in the monorepo, and library A depends on library B, it's incredibly important that it depends on the "local copy" of library B, and not some pinned version (for example, publishing library B to a package registry such as NPM or Maven, and then consuming it from there).

This becomes even more important if there are _many_ projects (perhaps dozens) in the monorepo that depend on library B: all of them must depend on the local, in-commit copy. This ensures that when library B _changes_, the pull request that changes it must also change _every consumer_ (if any change is required). Coherence is one principle that provides an important aspect of the monorepo mindset: every change must pay for itself.

Example: imagine the owner of a shared library is making an API change to a method, and this method is used in a dozen different projects in the monorepo. This PR should be blocked unless the author is able to modify every call site in every consuming project, along with any affected unit tests. If there's a particular project that can't be updated for some reason (perhaps it's unclear to the author how some new required value can possibly be obtained in the context the method is being called in), this is a sign that the _full cost of this change is higher than expected_. The author either needs to engage with that project's team to find a solution, or choose a different strategy (for example, introducing a new side-by-side method instead of the breaking change).

This way of working can initially be a shock for library owners, who are used to being a little more nimble. In non-monorepo ecosystems, a PR author is able to push out a new version of their project with virtually any change, the "extra cost" of upgrading eventually paid by other project owners. Over time, though, this increase in responsibility is more than made up for by the tighter feedback loop and increased visibility into your customers' use cases.

## Standardization

_Standardization_ is the third facet of a monorepo, and critical to its success. A way to think of standardization is this: for every problem you encounter in your repo, that problem should have exactly one solution. If you have TypeScript projects with unit tests, they should all use the _same_ test framework (and the same version of that test framework). If you have Android projects with snapshot (visual regression) tests, they should all use the _same tool_ to take those snapshots, at the _same version_. If you have C++ projects, they should all use the _same version_ of the compiler.

Each project in the repo has a different business purpose, and is maintained by one or more teams, but wherever you can identify _cross-cutting concerns_ across those projects and standardize them, you dramatically increase the power and efficiency of your repo, as it allows cross-cutting _experts_ to provide value to all projects at once in a single pull request.

Example: imagine a large TypeScript monorepo embarking on upgrading their version of Jest from v26 to v29. This upgrade could take a single engineer several days for a large complex project. However, once that initial cost is paid, the same engineer can probably upgrade a hundred similar projects (each using the same version of Jest, the same mocking and stubbing libraries, the same general test strategies, and so on), allowing a single mass-upgrade across the repo.

In contrast, if you have multiple projects with different test frameworks (Jest, Mocha, Vitest, etc.), some of which use different versions of those frameworks, this approach quickly becomes untenable. Instead of focusing the effort of a single engineer on delivering value to the entire codebase, each _team_ ends up growing their own "expert" on upgrading their test framework, learning the same lessons and paying the same costs dozens of times over.

## Recap

By embracing these three principles, organizations can unlock the full potential of the monorepo approach -- enabling scale, speed, and shared expertise across teams. "Putting all your code in one repository" is only the beginning of the monorepo journey!
