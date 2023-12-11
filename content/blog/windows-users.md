---
title: Windows users
subtitle: How much should you worry about Windows users in a MacBook heavy monorepo?
description: How much should you worry about Windows users in a MacBook heavy monorepo?
tweets: ['1678836731716550657']
date: 2023-07-11
tags: [publish, dev, monorepo]
---

In most of the companies I've worked at (especially in the last 12 years or so), it's been pretty much a given that all of the deployed stuff runs on Linux and all of the developers use MacBooks. Maybe there's a few Linux zealots that run a Linux distro personally on their laptops, and _maybe_ "somebody might have been using a Windows box", but nobody can remember who.

However, when running a monorepo, every time I've assumed that all of the developers will be using Mac/Linux, I've ended up regretting it. I've got some tips and approaches for handling Windows users in a 99% Mac repo (for some folks out there, this may also apply to those 99% Windows companies with their 1% Mac/Linux developers).

### 1. Assume you will need to support all platforms

Start with the assumption that you will end up needing to support Windows, Mac, and Linux developers in your repo. Often in the very early days of a new monorepo, you'll start by creating a script (like `common/scripts/setup.sh` for example) that does all kinds of setup work, and then Step #1 in your README will be "First, clone the repo, and run the setup script."

Even if you don't have time to fully flesh out corresponding setup script for Windows users, you can adjust your documentation -- for example, you can make a list of the programming tools, compilers, IDEs etc. that need to be installed, and then suggest that Windows developers install them manually (while Linux and Mac developers run the setup script instead). Even a bare-bones list of steps gives Windows developers an easy place to improve the docs, by fleshing it out or correcting errors when they join the repo and follow the steps for the first time.

If you are building a `setup.sh`, also consider specifically whether it is Mac-specific or will run on Linux as well. If the script is a mash-up of brew commands and also other commands that configure your git, add hooks, etc., consider automatically skipping the `brew install` steps if you are running on a Linux machine. (This might prompt you to then add a Setup doc specifically for Linux, if they need to install the skipped tools in a different way.)

### 2. Use CI to validate that tools work properly

If your monorepo contains tooling projects, which developers use when building other projects, make sure that future edits to these tools don't accidentally break a subset of your developers by running them in both Linux and Windows. This helps catch sneaky issues, like a unit test that relies on forward or backward slashes, or a tool that runs an external command that doesn't exist on a Windows machine.

In some cases it may make sense to build and run unit tests on all 3 platforms (Mac, Linux, and Windows boxes) in CI, especially in a polyglot repo that is used by developers working on different operating systems.

### 3. Avoid "glue" scripts written in Bash

For many monorepo maintainers, it's easy to fall back on bash scripts for simple utilities, glue scripts, for snippets of CI/CD pipeline logic, etc. However, when you need to run on both Windows and Linux, this can become tech debt just waiting to bite you... eventually that particular utility needs to run on a Windows box.

You can avoid this by sticking to naturally platform-agnostic languages instead of shell scripts -- for example, by writing gradle tasks in a Gradle repo, or nodejs scripts in a Rush repo. A large Swift repo, using Xcodebuild wrapped with Fastlane, might prefer Ruby scripts. Whatever you choose, using scripts that run the same way on every operating system will save you the hassle of converting them later.
