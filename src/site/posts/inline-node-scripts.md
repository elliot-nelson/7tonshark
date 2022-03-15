---
title: Inline Node Scripts
subtitle: Run inline node scripts in Azure DevOps pipelines.
description: Run inline node scripts in Azure DevOps pipelines.
tweets: ['1503829705228705795']
date: 2021-03-15
tags: [publish, cicd, azure]
---

Under normal circumstances, I'd recommend that any nodejs scripts used in your CI/CD pipelines be checked into the repository and run from your YAML pipeline using a normal node command, for example:

```yaml
steps:
  - script: |
      node scripts/build.js
    env:
      NODE_ENV: production
```

Keeping your scripts _out_ of your YAML pipeline has some clear advantages:

 - A dedicated `.js` file gets syntax highlighting and autocompletion in your editor.
 - You can write unit tests for the script, if desired.
 - You can choose to have different CODEOWNERS for your build scripts and your YAML pipelines.

Despite these advantages, there are situations where checking the script into the repository doesn't work.

 - You may need a setup script to run _before_ checking out the code from the repository.
 - You may want to run a pipeline that doesn't check out the repository at all.

In these situations, it's helpful to have an inline node script.

## Bash

In bash, we can run an inline node script by piping a heredoc:

```yaml
steps:
  - script: |
      echo "Running an inline node script..."
      node <<-'EOF'
      const package = require('./package.json');
      console.log(`Now I'm running in a nodejs script!`);
      console.log(`Node env is: ${process.env.NODE_ENV}`);
      console.log(`Building version ${package.version}...`);
      'EOF'
    env:
      NODE_ENV: production
```

Note how the heredoc pair -- `<<-'EOF'` and closing `'EOF'` -- is wrapped in quotes. This is important, because otherwise, syntax inside your nodejs script (like backticks and `${...}` blocks) would be interpreted by bash, totally breaking the syntax of your script. The quotes instruct bash to avoid any evaluation of the string until the closing the `'EOF'` tag.

## PowerShell

We can also use a heredoc in PowerShell, using a slightly different format:

```yaml
steps:
  - powershell: |
      echo "Running an inline node script..."
      @'
      const package = require('./package.json');
      console.log(`Now I'm running in a nodejs script!`);
      console.log(`Node env is: ${process.env.NODE_ENV}`);
      console.log(`Building version ${package.version}...`);
      '@ | node

      exit $LASTEXITCODE
    env:
      NODE_ENV: production
```

Again, make sure you use `@' ... '@` (single quotes) and not `@" ... "@`, to avoid evaluation of your node script by the shell.

> The line after the node script -- `exit $LASTEXITCODE` -- really shouldn't be required. I was forced to add this because piping into nodejs this way as the last command in a powershell script seemed to break some expectations of the Azure DevOps pipeline runner, and it would fail with an exception after my script was finished. Your mileage may vary!

## Passing command-line parameters

The easiest way to access values from your pipeline inside your nodejs script is to make them all environment variables (passed in via the `env:` property), and then grab them from `process.env` inside your script.

If you'd prefer to use parameters, just remember to add `-` as the first argument to node (the standard notation for "read from stdin").

Here's an example:

```yaml
steps:
  - powershell: |
      @'
      console.log(`My build directory is ${process.argv[2]}`);
      console.log(`My project name is ${process.argv[3]}`);
      '@ | node - "$(Agent.BuildDirectory)" $env:PROJECT_NAME
    env:
      PROJECT_NAME: Acme
```
