---
title: Reviewing PRs in a Monorepo
tags: [dev, monorepo]
date: 2024-08-17
---

There are many guides online for being a "good pull request reviewer", and a lot of the tips are broadly applicable to lots of professional situations: be courteous, be empathetic, be specific and constructive with feedback, and so on.

In a monorepo, with the large volume of PRs and the sheer number of contributors, it is even more important for maintainers to ensure that the right kind of community guidelines are established. Guidelines for how quickly a PR should be reviewed, how to treat your own team's code vs other team's code, how to navigate "drive by" feedback and demands, and so on.

Something I've found really helpful is to document exactly what role a reviewer should play, especially when there are different _types_ of reviewers. As an example, in our monorepos, we have an entire document dedicated to "Admin Reviews".

## Admin Reviews

An "Admin Review" is a review performed by the admin team for a monorepo, which usually consists of the monorepo maintainer team _plus_ a couple trusted build goalies from each of the largest teams in the repository. The idea is not necessarily to have representation from every team, but rather to have enough coverage across all your time zones that there's always a few admins available.

Pull requests that affect only one of your own team's projects aren't going to require an admin review. An admin review is only required if your PR touches a file that requires admin approval (through GitHub's `CODEOWNERS` file or a similar system); this might be because your Rush lockfile or configuration is updated, or it might be a version bump of a package in your Gradle `libs.version.toml`, or a new project is being added to the repo, and so on.

When you create a document like this, you want to make a few things crystal clear:

 - What is an Admin Review, and why would a PR require it?
 - How do you ask for an Admin Review? (i.e. what ticket system / slack channel to ping)
 - How to _give_ an Admin Review? (the important part)

When you add a new Admin to the Admin Team, the last bit is the most important, because you don't want an Admin to perform a typical code review. In particular, it is _not your job_ to actually look at any of the code! Don't look at any algorithms, don't look for code comments, don't offer style suggestions -- it's the job of the team who owns the project being touched to do _that_ review. The Admin's job is to act on behalf of the monorepo as a whole, and to ask: does the _name_ and _location_ of this new project make sense? Was this _package bump_ done correctly? Is there a README, does it explain what this project is for? Etc.

Training different groups of people to give different _types_ of reviews in different situations -- to put on the "code review" hat or the "admin review" hat -- is a key way to increase the flexibility of your code review pipeline.

## Cross-Team Reviews

Another thing I've found helpful is to provide guidance on how to review your _own team's_ code (code that requires your approval) and how to review _other team's_ code.

For your own team, many engineers -- especially seniors and higher -- often think of their role when reviewing pull requests as code quality gatekeepers. They are there to "protect" the project from badly written or buggy or (perhaps) just plain ugly code, and to demand fixes until it meets the desired level of quality. This isn't necessarily the ideal way to approach a review, but as long as it's isolated to that single team, it's manageable. The tricky part is PRs that touch multiple teams.

A classic example is a pull request for a library project. Some new feature or enhancement in the library is added, and it requires a small tweak to the API, so the PR also includes an update to several calls to the library scattered across applications in the monorepo. As expected, for this PR to merge, each application team with affected code has to give a sign-off.

The problem arises when folks from those application teams don't stop at reviewing the _line change in their application_ (which almost certainly is uninteresting and an automatic approval). Instead, they dive into the _code change in the library_, which may contain specialized business logic they aren't familiar with, or require coding patterns that are different than the patterns used in the applications. Having other teams post reviews demanding changes, or even blocking the PR, because it doesn't look as they expect is incredibly tedious for the library team.

To avoid this situation, you need to make it clear to contributors and reviewers that you expect people to treat their own team's code (where they are responsible) and other team's code (where they are not) differently, and to offer different kinds of feedback.

## Final thoughts

 - Give guidance on how to post and review PRs. Write it down and make it easily accessible (for example, in a `CONTRIBUTING.md`, linked from the main README and from the PR template). You can't rely on tribal knowledge alone.

 - Consider the most common ways that multi-team reviews occur in your repo, and if necessary, provide examples for people to follow in each of those scenarios.

 - If different _types of reviews_ are a good fit for your repo, take the time to create the appropriate teams or virtual teams and assign appropriate file responsibilities, and then document how they should review PRs and when those reviews are required.
