---
title: Faking a dynamic GitHub Actions "shell" property
date: 2024-08-19
tags: [cicd, github]
---

Ran into an issue recently where I was trying to do something which I thought was relatively simple: I had some steps in a reusable workflow, and I needed to run them in _PowerShell_ or _PowerShell Core_ depending on which runner I was running on (for legacy reasons, long story).

My first attempt, using a [fake ternary operator](/posts/github-actions-ternary-operator) expression:

{% raw %}
```yaml
  - name: Clean project folder
    shell: ${{ env.USE_POWERSHELL_CORE == 'true' && 'pwsh' || 'powershell' }}
    working-directory: ${{ matrix.project-folder }}
    run: git clean -f -d -x
```
{% endraw %}

However, I immediately got an invalid workflow error.

```text
Invalid workflow file: [...]: Unrecognized named-value: 'env'. Located at position 1 within expression: env.USE_POWERSHELL_CORE == 'true' && 'pwsh' || 'powershell'
```

Long story short, for whatever reason, the `shell` property actually doesn't support any kind of expressions at all, as far as I can tell -- at least none that depend on `env` or `matrix`.

## Double the steps

In my case, I was able to hack around the problem by defining _two_ steps, and then running one and skipping the other, depending on the value of the environment variable.

{% raw %}
```yaml
  - name: Clean project folder (pwsh)
    if: ${{ env.USE_POWERSHELL_CORE == 'true' }}
    shell: pwsh
    working-directory: ${{ matrix.project-folder }}
    run: git clean -f -d -x
  - name: Clean project folder (powershell)
    if: ${{ env.USE_POWERSHELL_CORE == 'false' }}
    shell: powershell
    working-directory: ${{ matrix.project-folder }}
    run: git clean -f -d -x
```
{% endraw %}

This trick also works if the steps produce outputs, but you'll need to make sure that _consumers_ of the output reflect the fact you don't know which one runs. Something like this should work:

{% raw %}
```yaml
  - name: Consuming step
    run: |
      echo "Result: ${{ steps.thing-pwsh.outputs.result || steps.thing-powershell.outputs.result }}"
```
{% endraw %}

## Wrap in an action

If you need to do several of these blocks, consider wrapping the whole mess in a _local reusable action_ instead. The advantage here is that although you are not allowed to refer to `env` or `matrix` contexts in the `shell` property, you _can_ refer to an action's `inputs` property.

So, if you define a reusable composite action:

{% raw %}
```yaml
name: My reusable action

inputs:
  shell:
    required: true

steps:
  runs:
  using: 'composite'
  steps:
    - name: Clean project folder
      shell: ${{ inputs.shell }}
      working-directory: ${{ matrix.project-folder }}
      run: git clean -f -d -x
```
{% endraw %}

Now your workflow can call `./.github/actions/my-reusable-action.yaml` and pass in the desired shell as an input, and you don't need to do the double-step nonsense. (The downside, as usual, is that all of the steps defined inside your reusable action stop being called out as individual steps in your workflow; your mileage may vary.)
