---
title: Ternary Operators in GitHub Actions
subtitle: How to mimic the ternary operator in GitHub Actions, and how to use it safely.
description: How to mimic the ternary operator in GitHub Actions, and how to use it safely.
tweets: ['1652027723160641537']
date: 2023-04-28
tags: [cicd, github]
---

About a year ago I wrote a post on how to mimic [ternary operators in Azure DevOps](https://7tonshark.com/posts/azure-ternary-operator/), and since I've been using a lot of GitHub Actions lately, I thought I'd do a similar post now. It turns out although a fake ternary operator is easy to construct in GitHub Actions, using it safely requires some caution.

## The syntax

In a GitHub Actions expression, you can use the syntax `foo && bar || baz` to simulate a ternary operator (with several caveats).

A classic example is where you want to include an optional parameter `--production` on a command line, but only if a checkbox `Production` is checked on a manual workflow. Here's how you could express that:

```yaml
name: Adhoc Run
on:
  workflow_dispatch:
    inputs:
      production:
        type: boolean
        description: 'Production?'
        default: false

jobs:
  build:
    name: Build
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - run: {% raw %}npm run build ${{ inputs.production && '--production' || '' }}{% endraw %}
        # => adds '--production' if box is checked, '' if not
```

However, _don't let this example fool you_ -- this syntax has many hidden dangers, especially when you combine it with some of the confusing comparison behaviors that GitHub Action expressions have.

## Navigating boolean values

In the example expression above, it works as expected because the _second operand_ is truthy. The reverse does not work:

```yaml
    steps:
      - uses: actions/checkout@v3
      - run: {% raw %}npm run build ${{ inputs.test && '' || '--production' }}{% endraw %}
        # => WRONG: produces '--production' no matter what
```

There's no good way to evaluate an `&& ||` expression when the middle operand is not truthy, so the best way to handle this situation is to reverse the truthiness of the _first operand_, and then flip the _second and third operands_.

```yaml
    steps:
      - uses: actions/checkout@v3
      - run: {% raw %}npm run build ${{ !inputs.test && '--production' || '' }}{% endraw %}
        # => RIGHT: adds '' if box is checked, '--production' if not
```

You can use the operand-flipping trick above for any situation in which the second operand is falsy: the boolean `false`, number `0`, string `''` and the value `null` (no value) are all falsy in GitHub Actions.

Note that the strings `'false'` and `'true'` are both truthy, so in the _special case where the result is a boolean_, you can also just use strings instead of booleans. A good example where you might do this is when passing an input into a reusable action; for example:

```yaml
    steps:
      - uses: ./.github/actions/build
        with:
          test_mode: {% raw %}${{ inputs.production && 'false' || 'true' }}{% endraw %}
```

## Dealing with null inputs

In a GitHub Actions workflow, the inputs are part of the `workflow_dispatch` event. This means _all your inputs_ are undefined (null) if the workflow is triggered by a pull request, a push, or a scheduled trigger. This can be very confusing, especially if you've specified `default:` values for your inputs, because they _won't be honored_ when the workflow is triggered by one of these events.

This situation is made worse because of GitHub's conversion logic. In the situation where the input is undefined, all of the following comparisons return true:

```bash
    steps:
      - run: |
          echo {% raw %}${{ inputs.production == false }}{% endraw %}
          # => true
          echo {% raw %}${{ inputs.production == '' }}{% endraw %}
          # => true
          echo {% raw %}${{ inputs.production == 0 }}{% endraw %}
          # => true
```

So, if you've defined the input `production` as a checkbox that defaults to `true`, how can we tell the difference between someone who is running the workflow and manually unchecked the box, and a scheduled trigger, where (presumably) we want the default `true` value to apply? The answer is that it's simply _not possible_ using the input value itself. The only way to properly handle this situation is to add special logic for the `workflow_dispatch` event.

Here's a full example of what this might like look:

```yaml
name: Push Release
on:
  workflow_dispatch:
    inputs:
      production:
        type: boolean
        description: 'Production?'
        default: true
  push:
    branches:
      - 'release/*'

env:
  PRODUCTION: {% raw %}${{ github.event_name != 'workflow_dispatch' && 'true' || inputs.production }}{% endraw %}

jobs:
  build:
    name: Build
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - run: {% raw %}npm run build ${{ env.PRODUCTION == 'true' && '--production' || '' }}{% endraw %}
        # => if check box is checked, '--production'
        # => if user unchecks box, ''
        # => if run on push, defaults to '--production'
```

Here we've used an intermediate environment value to make the workflow easier to read (although this isn't required). First, we check whether this is a manual run or not: if it's not, we specify the same "default value" specified in the `input`. If it is a manual run, then we use the value of `inputs.production` (which, in the case of a checkbox, is guaranteed to be true or false).

In the job step, we use our `env.PRODUCTION` value, which is a string -- `env` values are always strings, so we take care to do an explicit string comparison instead of treating it as just a truthy or falsy value.

## Reusing expressions with environment variables

If you find yourself copying and pasting complex ternary expressions to multiple places in your workflow, you might want to consolidate that into a single place. The simplest way to do that is with environment variables, just like the example above.

It's worth noting that although you can _set_ environment variables at the workflow level, they only _exist_ in the context of a running job. So if you want to use an expression in an `if:` clause of a job, or as an input into a job matrix, you cannot refer to an `env` value -- you'll get a workflow error. In those cases, you have no choice but to copy and paste the desired expression.

## Passing inputs to reusable workflows

When you create a _reusable workflow_, you can define inputs for these workflows. The `boolean` type of input is special in that what you pass must be a boolean, so if you pass a manual input in directly, you can get in trouble.

```yaml
jobs:
  build:
    uses: ./.github/workflows/_build.yaml
    with:
      production: {% raw %}${{ inputs.production }}{% endraw %}
      # WARNING: OK for manual workflows, blows up for other triggers
```

To avoid an error in this case, use the same `event_name` check.

```yaml
jobs:
  build:
    uses: ./.github/workflows/_build.yaml
    with:
      production: {% raw %}${{ github.event_name != 'workflow_dispatch' && true || inputs.production }}{% endraw %}
```

If you need your boolean input to default to `false`, just remember to use the operand flipping trick.

```yaml
jobs:
  build:
    uses: ./.github/workflows/_build.yaml
    with:
      production: {% raw %}${{ github.event_name == 'workflow_dispatch' && inputs.production || false }}{% endraw %}
```

> Technically, you can simplify the above to `{% raw %}${{ inputs.production || false }}{% endraw %}`, and it will work fine. I have started avoiding this syntax, however, because it's too easy to replace that `false` with a `true` or a `"BLUE"` or a `5` or any other default, truthy value, and expect it to work; leaving a landmine like that for other developers who aren't as familiar with the nuances of GitHub Actions can result in disaster.

## Passing inputs to reusable actions

A _reusable action_ has some special caveats when compared to a workflow.

Although the inputs block of a composite reusable action looks similar to the inputs block of a workflow, an action _only accepts strings_ -- every value you pass to an action will be converted to a string before your action receives it.

If you're copy-pasting some expressions from a workflow to an action, triple-check your first operand and make sure it is an explicit string comparison and not a truthy/falsy check. It'll look similar to the `env` example from up above.

```yaml
inputs:
  production:
    description: 'Production?'
    required: true

runs:
  using: composite
  steps:
    - run: {% raw %}npm run build ${{ inputs.production == 'true' && '--production' || '' }}{% endraw %}
```

## Final thoughts

Hopefully, this rundown of safe ways to use "ternary operators" in GitHub Actions is helpful to you.

A last caveat... all of the above is accurate as of April 2023, and seems unlikely to change, due to the potential blast radius in existing workflows ([classic Hyrum's Law](https://www.hyrumslaw.com/)). But, if you think it has changed, drop me a line and I'll update this post!
