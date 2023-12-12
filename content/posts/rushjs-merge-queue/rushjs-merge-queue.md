---
title: 30 Days of Merge Queue
subtitle: Lessons learned enabling GitHub's Merge Queue on our Rush monorepo.
description: Lessons learned enabling GitHub's Merge Queue on our Rush monorepo.
tweets: ['1661845124169584641']
date: 2023-05-25
tags: [publish, rushjs, monorepo]
---

We've had GitHub's [merge queue](https://docs.github.com/en/repositories/configuring-branches-and-merges-in-your-repository/configuring-pull-request-merges/managing-a-merge-queue) feature enabled on our [Rush](https://rushjs.io) monorepo for a little over a month now, and overall it's been a great experience.

## Why merge queues?

Before diving into specifics, let's cover what a merge queue _is_.

If you've managed a traditional repo of any size in GitHub before, you're probably familiar with this gem in the Branch Protection settings:

{% image "./require-up-to-date.png", "Screenshot: Require branches to be up to date" %}

If you have several people merging pull requests into your repo, and they haven't pulled the very latest version of the main branch (possibly from just minutes ago), there's a timing issue: the pull request may pass all unit tests, but after you merge, the main CI branch begins failing. This typically happens when two developers make conflicting changes (conflicting, not in a sense that will be detected by git, but in the sense that the API for a particular module or function is changed by one developer which breaks the changes being made by a different developer).

The _Require branches to be up to date before merging_ setting puts a hard-stop to this: the second developer cannot merge until they pull in the very latest changes, which requires a new pull request build. Checking this box can drop CI-breaking incidents in main to nearly zero.

In a monorepo, however, this box has a massive cost. If you are peaking at 10 or 15 pull requests merged per hour, and every time someone merges everyone else is forced to merge latest, you end up with all the developers crammed against the gate, trying to get the lucky lottery ticket to be "first". Whoever wins, gets merged; everyone else has to manually pull in latest, sip coffee for 15-20 minutes, and then try to enter the lottery again.

A merge queue solves this problem: instead of each developer attempting to be next to merge, they can _all_ join the merge queue and then leave for lunch. GitHub's promise is that it will take each PR in the queue, merge it with latest from main, run your workflow, and then merge it to main only if it passes. All of the queued PRs will eventually merge to main, with those failing checks being ejected from the queue for the developer to re-examine.

## Triggering merge queue builds

When enabling a merge queue for the first time, be aware that the _event_ for a merge queue (called `merge_group`) is a different event than the `pull_request` event. If you don't turn on this event for all branches that might trigger a merge group, it will never run, effectively blocking anyone from merging.

In our `pull-request.yaml` workflow, we ended up with a triggers section like so:

```yaml
on:
  pull_request:
    branches:
      - main
      - 'release/**'
      - 'stable/**'
  merge_group:
    branches:
      - main
      - 'release/**'
```

Another caveat here is that the _event structure_ for the triggering event is also different. As an example, if your PR build runs `rush change --verify` to ensure change files are created, the typical property `github.base_ref` is formatted differently than usual, which can cause the Rush command to break.

We solved this by creating a top-level variable we use everywhere else:

```yaml
env:
  # For pull requests, take the ref (e.g. "main") and return "origin/main"
  # For merge groups, take the base sha and use that instead (e.g. a098cde3)
  USE_BASE_REF: {% raw %}"${{ github.base_ref && format('origin/{0}', github.base_ref) || github.event.merge_group.base_sha }}"{% endraw %}
```

_(If you have questions about the syntax here, see [Ternary Operators in GitHub Actions](https://7tonshark.com/posts/github-actions-ternary-operator/).)_

Later in the workflow, you can use this variable anywhere you'd refer to base_ref:

```yaml
    steps:
      - name: 'Prettier check'
        run: {% raw %}node common/scripts/install-run-rush.js prettify --mode check --base "${{ env.USE_BASE_REF }}"{% endraw %}
```

## Developer experience

Overall, the merge queue does exactly what it says on the tin: instead of a "Squash and merge" button, developers get a "Merge when ready" button. Clicking it drops you into the queue, where (in 15-20 minutes, assuming you're at top of queue) you'll merge into the main branch.

{% image "./empty-merge-queue.png", "Screenshot: An empty merge queue screen" %}

In addition, if you already have your PR approvals and are just waiting for your latest PR build to finish, you can click the "Merge when ready" button while it's still gray. Assuming your PR build succeeds, you'll automatically join the queue when it finishes. This type of "click the button and go for lunch" feature is a valuable time-saver for developers.

## The caveats

There are some negatives to enabling a merge queue. Because you are running your PR build _twice_ (once to validate the PR, a second time as you attempt to merge), expect your runner bill with GitHub to double. (For many jobs in our current PR build workflow, we are using Linux 8-cores, and even one Linux 16-core; so whatever you are paying for that currently, you'll pay twice as much).

Similarly, your _minimum latency_ will also double: if your PR build typically takes 15 minutes, then the bare minimum time for a developer to land a change in main will now double from 15 minutes to 30 minutes. This is alleviated somewhat because the _developer's_ time is still only 15 minutes -- they can move onto another task after they click the green button -- but if other folks are waiting on a fix to land, that wait time has now doubled.

It also means the maximum throughput is constrained, by the same values: if your PR build is 15 minutes, then the maximum number of PRs you can merge per hour is 4 PRs. If your peak time is ~10 PRs an hour, then you're going to end up with PRs in the queue that may take a couple hours to actually land in main.

This issue, above, can be avoided to some degree by using GitHub's merge queue configuration, which allows you to specify minimum and maximum batch sizes and wait times (several PRs that enter the queue together can be merged into a _single_ build, and if it succeeds, they'll all merge together at once). How effective these settings are depend somewhat on your average success rate: if 99% of your builds succeed, then larger batch sizes offer a big throughput improvement. But bigger batch sizes also mean more rework for every failure, making them significantly more expensive than they used to be.

Here's a screenshot of our current settings, arrived at by trial and error. Our preference is "normal", one-build-for-each-PR behavior, but allowing a little bit of batching to help get through the peak periods and avoid long queue times.

{% image "./merge-queue-settings.png", "Screenshot: Merge queue settings" %}

> Something to be aware of if you allow batching PRs: in your Push to Main CI workflow, although each PR merged will be added as its own commit, the "bundled" PRs don't show up as separate lines in your run history in the GitHub UI. This caused us some confusion a few times when we wanted to track down infrastructure jobs trigger by merged PRs, and we could see the commits in main but could not find the corresponding Push to Main workflow run. In these cases, the PR was "hidden" in a nearby run of the workflow. Keep this in mind if your Push to Main workflow does significant work that you sometimes troubleshoot.

---

So far, I've very happy with the "Rush + Merge Queue" workflow (and, in fact, we've also enabled the Merge Queue on our Swift and Kotlin monorepos as well, with similar results). However, I don't have many experiences to compare it to -- I know that Gitlab, for example, offers "Merge trains" which provide similar features. If you've used other products and can compare them to GitHub's Merge Queue, I'd be interested in hearing about it!
