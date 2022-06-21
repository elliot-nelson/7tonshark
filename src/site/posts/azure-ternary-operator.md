---
title: Ternary Operators in Azure DevOps
subtitle: Mimic the ternary operator in an Azure DevOps pipeline.
description: Mimic the ternary operator in an Azure DevOps pipeline.
date: 2022-06-03
tags: [cicd, azure]
---

When authoring an Azure DevOps pipeline, I often want to reach for the ternary operator (`?:`), which unfortunately doesn't have a direct equivalent. For example, you might have a template parameter called `production`, and if it is `true`, you want the string `"--production"` inserted into the command line; if it isn't, you want nothing (`""`) inserted instead.

In JavaScript, you could write `production ? '--production' : ''`. Here's a few ways to express the same things in your YAML pipeline; you can pick the one best suited to your situation.

## 1: Double replace

In Azure YAML, when you coerce a boolean to a string, it results in the string `True` or `False` (just like PowerShell). You can take advantage of this by using the [replace function](https://docs.microsoft.com/en-us/azure/devops/pipelines/process/expressions?view=azure-devops#replace) twice:

{% raw %}
```yaml
parameters:
  - name: production
    type: boolean
    default: false

steps:
  - script: npm run build ${PRODUCTION_FLAG}
    env:
      PRODUCTION_FLAG: ${{ replace(replace(parameters.production, 'True', '--production'), 'False', '') }}
```
{% endraw %}

## 2: Conditional template insertion

If you are working with parameters (or other values that are fixed when the template is compiled), you can use [conditional insertion](https://docs.microsoft.com/en-us/azure/devops/pipelines/process/templates?view=azure-devops#conditional-insertion) instead.

{% raw %}
```yaml
parameters:
  - name: production
    type: boolean
    default: false

steps:
  - script: npm run build ${PRODUCTION_FLAG}
    env:
      ${{ if (eq(parameters.production, true)) }}:
        PRODUCTION_FLAG: '--production'
      ${{ if (eq(parameters.production, false)) }}:
        PRODUCTION_FLAG: ''
```
{% endraw %}

These insertion statements are evaluated very early and the result is baked into the compiled template, before it begins running. This approach would be ideal if you'd like to set multiple environment values based on the result of the expression, or even insert an entire block of YAML instead.

## 3: Defer to the script

A final option that is always available to you is to wait until your script is actually running, and treat the incoming value as a string inside your script. In this case, Bash or PowerShell is performing the ternary operation, rather than Azure.

For example, in Bash:

{% raw %}
```yaml
parameters:
  - name: production
    type: boolean
    default: false

steps:
  - script: |
      case "${{ parameters.production }}" in
        True) PRODUCTION_FLAG='--production' ;;
        *) PRODUCTION_FLAG='' ;;
      esac

      npm run build ${PRODUCTION_FLAG}
```
{% endraw %}

Or, in PowerShell:

{% raw %}
```yaml
parameters:
  - name: production
    type: boolean
    default: false

steps:
  - powershell: |
      $PRODUCTION_FLAG = If ("${{ parameters.production }}" -eq "True") { '--production' } Else { '' }

      npm run build ${PRODUCTION_FLAG}
```
{% endraw %}

You can also pass in your values from the environment and use them that way, which may be more understandable if you use them in multiple places. Here's an example of going from a string value to a boolean, rather than a boolean to a string:

{% raw %}
```yaml
parameters:
  - name: buildFlavor
    values: ['dev', 'alpha', 'beta', 'release']

steps:
  - powershell: |
      $DEV_PANEL = If ($env:BUILD_FLAVOR -eq 'dev' -OR $env:BUILD_FLAVOR -eq 'alpha') { 'true' } Else { 'false' }

      npm run build $DEV_PANEL
    env:
      BUILD_FLAVOR: ${{ parameters.buildFlavor }}
```
{% endraw %}

Hopefully, one of these examples works for your situation.
