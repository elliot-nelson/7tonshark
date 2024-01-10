---
title: String Operations in GitHub Actions
date: 2024-01-10
tags: [cicd, github]
---

Expressions in GitHub Actions pipelines have some gaps that can make simple operations rather frustrating. I've been bitten more than once while attempting to _concatenate a string_, or _join an array of strings_. Here's some string operations tips to add to your Actions toolbox.

## Concatenating several strings

Ever tried something like this?

{% raw %}
```yaml
  - run: |
      ls
    working-directory: ${{ join([env.TEMP_DB_FOLDER, env.PROJECT_NAME, 'artifacts'], '/') }}

    # => Unexpected symbol: '['
```
{% endraw %}

The problem here is not the `join()` function itself, it's that GitHub Actions expression syntax _does not have any way to express an array literal_. To call `join()` successfully you need to obtain an array from some other supported method... for example, by parsing it from a JSON string:

{% raw %}
```yaml
  - run: |
      echo ${{ join(fromJSON('["1", "2", "3"]'), ' and ') }}

      # => 1 and 2 and 3
```
{% endraw %}

However, this doesn't help much in our original example, because we need to inject these dynamic variables into the array. For simple cases like this it's probably easiest to avoid the function call altogether by breaking it into multiple expressions.

{% raw %}
```yaml
  - run: |
      ls
    working-directory: ${{ env.TEMP_DB_FOLDER }}/${{ env.PROJECT_NAME }}/artifacts
```
{% endraw %}

## The format function

In the example above, I showed how you could "concatenate" strings just by cutting them into multiple expressions. One situation where you _can't_ do that is if you are already stuck inside an expression (perhaps a [fake ternary operator](/posts/github-actions-ternary-operator) expression).

The `format()` function can help out for simple string concatenation in this case. For example, here's the "working directory" example from above expressed as a format call:

{% raw %}
```yaml
  - run: |
      ls
    working-directory: ${{ format('{0}/{1}/{2}', env.TEMP_DB_FOLDER, env.PROJECT_NAME, 'artifacts') }}
```
{% endraw %}

Here's an example I've run into more than once, using a fake ternary operator that wraps a call to `format()`.

{% raw %}
```yaml
  env:
    BASE_REF: ${{ github.base_ref && format('origin/{0}', github.base_ref) || github.event.merge_group.base_sha }}
```
{% endraw %}

In this case, we're checking if `github.base_ref` exists; if it does, I know this event is a pull request and I want to prepend it with `origin/`. If it doesn't exist, I know the event is a merge group event instead, and I _don't_ prepend `origin/` because the base will be a temporary commit SHA instead of a branch name.

## Using join on splats (object filters)

One special case where `join()` is actually useful is when you can perform a splat operation on a natural GitHub array, like a list of jobs you are dependent on.

For example, a common construct I write in workflows:

{% raw %}
```yaml
  # Run if any previous job failed
  if: ${{ contains(join(needs.*.result, ','), 'failure') }}
```
{% endraw %}

## JSON-to-JSON property selection

Again using a splat, we can actually "select" a property out of a JSON blob using just the JSON string functions. For example, suppose we have a job called `get-projects` that produces an output `projects` that looks like this:

```json
[
  {
    "project_folder": "apps/my-app",
    "infra_folder": "apps/my-app/infra/terraform"
  },
  {
    "project_folder": "apps/your-app",
    "infra_folder": "apps/your-app/infra/terraform"
  }
]
```

I can "select out" an array of `infra_folder` entries and send that JSON array to another job:

{% raw %}
```yaml
  with:
    infra_folders: '${{ toJSON(fromJSON(needs.get-projects.outputs.projects).*.infra_folder) }}'
```
{% endraw %}

## Checking if an array is empty

GitHub Actions will generate an error if you attempt to run a `matrix` job and there are no jobs to run. This is one use case where it's useful to check if there _are any entries_ in the array. Since there's no first-class support for arrays, we can abuse string operations for this once again:

{% raw %}
```yaml
  if: always() && fromJSON(needs.get-projects.outputs.projects)[0]
```
{% endraw %}

The easiest way to ask "is an array empty?" is to just access the first element, which (if it's null) will be falsy.
