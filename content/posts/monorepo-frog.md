---
title: Comprehensive Monorepo Maintenance
date: 2024-04-20
tags: [monorepo]
draft: true
---

## Responsibility vs Cooperation

As monorepo builders, we start with visions of a collaborative space where many development teams can build applications cooperatively, learning from each other and delivering value for the company. Unfortunately, this "shared space" vision is often at odds with organizational reality.

As a company grows, teams become more and more specialized, and what they own or are responsible for becomes more discrete and specific. Something that started as merely an application feature the "app team" built, now has multiple teams and multiple layers of managers, with internal SLAs and on-call rotations. Team leads are incentivized to "protect" their teams from work on systems they aren't directly responsible for. As the organization calcifies, it becomes harder to convince developers living in your monorepo to reach across the aisle and chip in on sibling projects, or contribute coding standard or dependency upgrades at a monorepo level.

This common pitfall is most dangerous, however, when it happens to _your own team_. If you helped build and maintain a monorepo, and your team is the "build pipeline" team, then what you are technically _responsible for_ is often limited to the set of things that get you out of bed during on-call rotation -- CI pipelines, build nodes, failures in scripts your team owns, and so on. But this is only a subset of the things that are critically important in a functioning monorepo.

 * The local developer experience, including actions like initial monorepo checkout, switching between and creating new branches, and finding documentation on how to create new projects, is important.

 * Pre-commit and pre-push hooks, if you use them, are very useful tools, but also easy ways to annoy developers. If failures or long run times are creeping into your hooks, local devs may start skipping them or disabling them entirely, essentially locking you out even if you improve them in the future.

 * Editors and IDEs are often an integration pain point -- all of your source code may be organized, formatted, and linted using industry-standard tools, but does it show up right in the editors and IDEs your developers are actually using? Does opening a project or saving a file in the IDE feel slow? If the IDE supports git commits and pushes, do your hooks work properly?

 * You're probably already tracking PR build time (the time it takes to compile and run unit tests after a branch is pushed). But on average, _how many_ times will a developer push changes before being able to merge that PR, and how many of those times resulted in failures?

 * Integration test runners and UI snapshot frameworks are key late-stage features for many projects, and may require careful balancing between feature coverage and build time. This is an area where you usually "leave it to the developers" to start with, but that may not work in the long term.

For a monorepo to remain viable in the long term, _all aspects_ of the developer experience need consistent attention from people dedicated to the monorepo's success. We need strategies for ensuring our initial vision can thrive.

## Abusing Conway's Law

Conway's Law is an adage that tells us the systems we build tend to reflect the organizational hierarchy of the team thats built them.

Usually, this is a bad thing -- it describes, for example, an application that has two features that are incompatible or should be combined into one feature, but they can't because they are owned by two different teams. Combining the features, which should be a simple application refactoring, implies an entire team of people might no longer have jobs, or that two teams that report up to totally different directors should be combined together. None of the directors or managers in this scenario have any incentive to risk organizational change, which locks out the obvious (to the individual developer) application change.

However, if you can ensure that the _team that maintains the monorepo_ reports up to the same organization that _writes most of the code_, you get a lot of alignment "for free". Your manager's manager has every incentive to ensure that all those IDE and local build and pre-push hooks are working great, because you're close enough to the people that would experience those pain points.

This strategy can be effective, but has a shelf life -- if a monorepo is successful and continues to grow, it will inevitably contain projects from multiple directors or even multiple business units. At this stage, whatever director or SVP owns the "monorepo team" is the home team and everyone else is a guest. You are farther away from the individual problems and unique constraints of these "away teams", and so the same problem has resurfaced.

## Expanding responsibility intentionally

If your team already exists

If you can ensure that your monorepo team -- theo ne
One way to accomplish this might be to
One way


---




There are several ways to ensure that

So,
So, how do we prevent

So, how do we

So,
So, how do we fix this?
So how do



As

 * ASf

 * Asdf

Hey




An over-focus on


In some ways,
As a monorepo maintainer,

As a monorepo maintainer

Ahah ahaha hahaha
