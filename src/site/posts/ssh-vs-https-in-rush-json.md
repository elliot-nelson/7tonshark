---
title: SSH vs HTTPS URLs in Rush config files
subtitle: Support both SSH and HTTPS URLs in your rush.json repository configuration.
description: Support both SSH and HTTPS URLs in your rush.json repository configuration.
tweets: ['1593327379354640384']
tags: [publish, rushjs, monorepo]
date: 2022-11-17
---

A few years ago, GitHub changed most of their [default instructions](https://docs.github.com/en/repositories/creating-and-managing-repositories/cloning-a-repository) for cloning a repository to use HTTPS URLs instead of SSH URLs (and correspondingly, using Personal Access Tokens instead of SSH keys for authentication).

However, there are still many reasons that some developers on your team might prefer SSH keys over PATs -- especially for developers who work on different codebases in different languages, where first-party IDE support for SSH config might be better than support for git credential helpers or other solutions.

Luckily, you don't have to pick one -- the default `rush.json` in your [Rush monorepo](https://rushjs.io) has a setting for `repository.url`, but it supports setting `repository.urls` instead.

Here's an example:

```json
{
  "repository": {
    "urls": [
      "https://github.com/acme/dynamite.git",
      "git@github.com:acme/dynamite.git"
    ],
    "defaultBranch": "main",
    "defaultRemote": "origin"
  }
}
```

When Rush looks for the default remote (for example, when running `rush change` locally), it will check the list of remotes in your local git clone against the URL list above, and use the first match it finds -- this way developers cloning with SSH will automatically use their SSH key, and developers cloning with HTTPS will automatically use their Personal Access Token.
