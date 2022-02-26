---
title: Line \ Continuation
date: 2021-02-21
tags: [post, cicd]
---

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
