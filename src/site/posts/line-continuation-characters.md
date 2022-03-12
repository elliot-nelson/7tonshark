---
title: Line \ Continuation
description: Examples of line continuation characters in Bash, Batch, and PowerShell.
tweets: ['1498720510904918022']
date: 2021-03-01
tags: [publish, cicd, bash, powershell]
---

Examples of line continuation characters in Bash, Command (Batch) and PowerShell.

## Bash / zsh / sh

``` bash
cd apps/my-app
rushx build-native \
  --platform ios \
  --flavor dev \
  --clean
```

## Batch (dos command script)

``` batch
cd apps/my-app
rushx build-native ^
  --platform ios ^
  --flavor dev ^
  --clean
```

## PowerShell

``` powershell
cd apps/my-app
rushx build-native `
  --platform ios `
  --flavor dev `
  --clean
```
