---
title: Avoid Red Checks
subtitle: (Unless you need the developer to do something about it.)
description: (Unless you need the developer to do something about it.)
tweets: ['1501300028333125640']
date: 2021-03-08
tags: [post, cicd, github]
---

Part of building a working CI pipeline is deciding what checks should block merges, and what checks are merely informational. If you're not careful, though, "informational" checks will do more harm than good.

In this screenshot, we have a GitHub pull request that cannot merge because it has failed a required check:

![Example of a blocking error](pr-blocking-errors.png)

Compare it to this screenshot, which _can_ be merged, because it has failed a non-required (or "non-blocking") check:

![Example of a non-blocking error](pr-nonblocking-errors.png)

Developers are still _users_, and users are looking for the information they believe they need on the screen. After fielding countless questions from developers on many teams, I've decided that most people simply will not see that little **(Required)** tag next to the checks -- the only thing they are going to see is that the **Squash and merge** button is red, and then, if you're lucky, they'll try to figure out how to turn any red checks they see into green checks. (If you're unlucky, then it's straight to your team's Slack support channel.)

Takeaway: _never_ present a developer with something red, unless you truly intend to block their progress. A big red X that "sometimes" isn't actually an error only frustrates your user and makes them trust your pipeline less, something you want to avoid at all costs.

---

In contrast, let's compare two different screenshots. First, here's an "all green" pull request, ready to go:

![Something](pr-all-green.png)

And here's another pull request that's ready to go, but with a check that was skipped instead of successful:

![Something](pr-nonsuccessful.png)

In the second screenshot, there's a lot of additional context and text to read on the screen, but because there is nothing _red_ on the screen, the developer intuitively knows that there's nothing for them to fix. There's no guarantee they'll read the context you've provided, but at least they won't be left wondering whether or not it's OK for them to merge.

Takeaway: when you're in a situation where a green (successful) status isn't appropriate, consider using **Skipped** as an alternative to **Failed**.

> Why not just make everything green? Doing so might violate a different, unrelated set of expectations from your developers. For example, maybe you have a pipeline that exists to build and publish native builds, but for some PRs those builds aren't applicable.
>
> Having the builds "succeed" when they haven't actually produced a native build could cause confusion and even downstream errors for other pipelines; a status of "skipped" (with an explanatory commit status message) would be more appropriate, and still avoids the show-stopping red **Squash and merge** button.
