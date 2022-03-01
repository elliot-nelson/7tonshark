---
title: Line \ Continuation
description: Examples of line continuation characters in Bash, Batch, and PowerShell.
date: 2021-03-01
tags: [post, cicd]
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
