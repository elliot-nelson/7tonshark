---
title: Checking out fork branches
subtitle: Easily checkout remote forked branches in a public repo.
description: Easily checkout remote forked branches in a public repo.
tweets: ['1600948860255600640']
date: 2022-12-08
tags: [publish, dev]
---

If you're an open source maintainer, or just an interested developer that wants to try out the changes in a pull request submitted by another contributor, it is now incredibly simple.

## Auto setup remotes

The first thing to do is turn on `autoSetupRemote`, a feature introduced in Git 2.37.0.

If your version of Git is lower than this, upgrade by following the [official install instructions](https://git-scm.com/book/en/v2/Getting-Started-Installing-Git) or running `brew install git` (for Homebrew users).

Once you've upgraded, run the following command to turn `autoSetupRemote` globally:

```bash
git config --global --add --bool push.autoSetupRemote true
```

## Using GitHub CLI

If you aren't already using the GitHub CLI `gh`, [install it](https://github.com/cli/cli)!

Then, from your local clone of the public repo, run:

```bash
gh pr checkout 2896
```

It'll setup a new remote and checkout the branch automatically -- you can pull any new commits with `git pull`, and even push up commits to the branch (if you're a maintainer and the appropriate checkbox is checked in the pull request).

## Using Git

This is not nearly as nice, but if you can't use the GitHub CLI, it is an option.

For your own repo, run (one time):

```bash
git config --add remote.origin.fetch "+refs/pull/*/head:refs/remotes/origin/pr/*"
```

Or, if it's a public repo and you are forking it, use upstream instead:

```bash
git config --add remote.upstream.fetch "+refs/pull/*/head:refs/remotes/upstream/pr/*"
```

Now running `git pull` will automatically pull down the pull request branches, and you can check them out like:

```bash
git checkout pr/2896
```

This does automatically set up remotes for you, so you can't interact directly with the other contributor's remote (like pushing commits to it) unless you set up the remote separately.

## GUI Options

If you prefer a GUI for Git, then you likely use this feature already, as there are lots of tools that offer one-click pull request checkouts: VSCode Git integration, GitKraken, and the GitHub Desktop app, for example. If that sounds more your speed, try one out!
