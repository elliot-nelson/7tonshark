---
title: "Copilot: A cascading recipe loader"
date: 2025-06-30
tags: [dev, ai]
description: Loading cascading context-sensitive recipe files while coding with Copilot.
---

{% image "./banner.png", "Copilot: A cascading recipe loader" %}

## The goal: customizing your development language

Lately, I've been really interested in being able to customize the _language I use to interact with Copilot_ so that I can give it commands, and have those commands interpreted the way I want them, potentially differently based on context (e.g. a GitHub Actions YAML file versus a JavaScript file).

What really frustrated me was that detection is so hit-or-miss. If I asked Copilot to "add a slack notification" to a reusable action, it might pick up my recipe file for "adding slack notifications" -- but if I asked it to "make this function pop", it might just interpret that as natural language rather than using my specific definition of "make it pop".

Recently I've been iterating on prompts with Copilot in VSCode against Sonnet 3.7; every time the prompt fails, I ask it to improve the prompt so it would behave the way I want. Over time, I watched it become more and more forceful: first it starts adding `IMPORTANT: Before responding, do <xyz>.` Then it adds `CRITICAL INSTRUCTION: Before processing request, do <xyz>.` Then it adds `DO NOT RESPOND BEFORE PROCESSING <xyz>.`

Eventually your entire instruction set is full of these incredibly forceful commands and dire warnings to, essentially, "not act normal"... and it really still only works about half the time.

My conclusion is: no matter how much context you include to override default behavior, your _actual instructions_ and the inertia of the language model make it extraordinarily difficult to change the basic meaning of certain words.

## Using a hook

I've found that when working with AI, if you have to work _that hard_, you aren't going to be successful. You need a different strategy.

My strategy here is to use a "hook": you need to have the simplest, minimal way to speak to the AI that gets it to realize it needs to think a little bit differently, and that gets the ball rolling on the rest of your custom instructions.

The hook I've found is a magic phrase: **use my recipe**. In other words, I don't tell Copilot: "looks good, let's add a slack notification" - I say "looks good, let's add a slack notification, use my recipe". This addition is relatively natural for me to remember, it's only a few words, and it allows your contextual instructions to be relatively relaxed; the reminder in your prompt to "use my recipe" is enough to get the cognitive ball rolling.

## What's a recipe?

First off, note that a "recipe" is not anything at all; it only has the meaning you assign it. I have tested referring to recipes as "glorkmewks" and using a "glorkmewk" folder instead of a "recipe" folder, and it all works exactly the same. So the key here isn't in the name _recipe_, it's more the way you provide structure to the AI (Sonnet in particular in this case).

First, we'll create a folder (in my case `~/dev/recipes/`) to house our recipes. I've given it this rough structure:

```text
  ~/dev/recipes/
    global/
    github-action/
    github-workflow/
    js/
    just-for-fun/
    ts/
```

Now, let's start filling in some files. The way I'm going to start is by adding some key files for _testing_ (I want to ensure the structure actually works before I start filling in my real useful recipes).

```text
  ~/dev/recipes/
    global/
    github-action/
      github-action-context.md      <<<
      make-it-pop.md                <<<
    github-workflow/
    js/
      js-context.md                 <<<
      make-it-pop.md                <<<
    just-for-fun/
      pirate.md                     <<<
    ts/
```

First, let's look at "make it pop". I want this phrase, which would normally be interpreted by Sonnet into a kind of vague "spruce up my file" command, to mean something very specific, and I want that specific thing to be different based on what file Copilot is working on.

Here's my definition for `github-action/make-it-pop.md`:

```md
<recipe name="make it pop" context="github action">
If I ask you to "make it pop", I mean to update the header
of the YAML file with a banner comment describing the
usage, inputs, and outputs of the reusable action.
</recipe>
```

Note that I am providing _structure_ here, in the form of XML tags; the tag name is not meaningful, but the fact I am _defining something_ -- a thing of type "recipe" -- is meaningful.

Let's also define `js/make-it-pop.md`:

```md
<recipe name="make it pop" context="js">
If I ask you to "make it pop", I mean to refactor all
function, method, and variable names to include sparkly,
fun, cute buzzwords, brightening the day of anyone who
reads the code.
</recipe>
```

Now that we have a couple context-sensitive definitions of "make it pop", we need to go up one level, and define the contexts in which these recipes should apply.

First, I'll create `github-action/github-action-context.md`:

```md
<recipe name="github action" type="context">
This recipe provides additional instructions when editing
GitHub Actions YAML files (reusable actions).

Insert spaces between every step, and two spaces between
major blocks (inputs, steps, etc.).

If I ask you to "make it pop", load recipe `github-action/make-it-pop.md`.
</recipe>
```

Here I've invented (again, completely imaginary) a special "type" of recipe, which is a "context", applying to GitHub reusable actions.

We'll make a similar new "context recipe" for JavaScript:

```md
<recipe name="js" type="context">
This recipe provides additional instructions when editing
JavaScript (js) files.

My editor is small, so line wrap at 40 characters.

If I ask you to "make it pop", load recipe `js/make-it-pop.md`.
</recipe>
```

Finally, let's define a just-for-fun recipe, which is actually a mode that can be enabled and disabled:

```md
<recipe name="pirate mode">
If I enable "pirate mode", I mean: for the rest of this session,
we are both pirates, and you should use colorful pirate-themed
phrases and responses whenever you can.
</recipe>
```

## The Recipe Loader

OK, now that we have a _folder structure full of recipes_ to work with, we need to actually create the recipe loader. For this, I'm going to use the `.github/copilot-instructions.md` file used as base context in Copilot.

Here is the entire file:

```md
<recipe-folder>
All recipes are located in `~/dev/wbd/recipes/` (~ is the user's home folder).
</recipe-folder>
<recipe-instructions>
Recipe files live outside the workspace, and any reference to them is relative to the recipe folder.

IMPORTANT: On every interaction, before working on the request, examine editorContext and keywords in my request, determine relevant recipes, and load them. Make sure to recursively load any additional recipes that are relevant. Assume files exist and load them directly from disk.

If you attempt to load a recipe and fail for any reason, immediately abort all thinking and inform me: `Failed to load recipe <recipe name> (<absolute recipe path>)`.

Recipe contexts:

Files ending in `.js`: load recipe `context/js.md`.
Files ending in `.ts`: load recipe `context/ts.md`.
Files ending in `.yaml` in `.github/workflows` folder: load recipe `context/github-workflow.md`.
Files ending in `.yaml` in `actions` folder: load recipe `context/github-action.md`.

Keywords:

I refer to "pirate mode": load recipe `just-for-fun/pirate.md`.
</recipe-instructions>
```

Again, we invent new tags to provide structure to the AI. (Your own instructions file could include many other blocks with similar tags providing instructions on the AI's role, your experience level, background information on your team, etc.)

You can see some specific "workarounds" in these instructions, based on the particular behavior of Sonnet 3.7 in Copilot in VSCode, and so you may have to adjust the exact language if you change editors or models. Note also this requires Agent mode (Ask/Edit mode cannot read files from disk unless they are manually added to context or the folder is added to the workspace.)

Many of these workarounds, by the way, were deduced by asking Sonnet repeatedly: `EXPLAIN: I expected you to load a recipe while processing that last request, but you didn't, why not?` (or similar variations); you can then use the additional detail to adjust the prompt and avoid that pitfall, or even ask it to improve the prompt on its own.

Explicitly instructing the AI to fail if a recipe is missing is a big usability improvement here, because it loves to "fail silently" and proceed with its own assumptions. If there's a simple typo in your file name, you want to know that immediately, not wonder why the generated function doesn't match your instructions.

## Does it work?

Yes! Here's a real-life conversation history using the definitions above, in my editor, in a brand-new Copilot chat window (some file names removed):

> **Me:** Let's make this pop. Use my recipes.
>
> **AI:** I'll help you improve the `action.yaml` file in the `....` directory. Let me first load the relevant recipes based on the context.
>
> ✓ Reading `/Users/elliot.nelson/dev/recipes/github-action/github-action-context.md` lines 1-100
>
> Let me load the "make-it-pop" recipe:
>
> ✓ Reading `/Users/elliot.nelson/dev/recipes/github-action/make-it-pop.md` lines 1-100
>
> Now let me examine the current action.yaml file to understand its structure and purpose:
>
> ✓ Reading `/Users/elliot.nelson/dev/..../action.yaml` lines 1-100
>
> Let me also check if there's a .........js file to understand what's included in the notification payload:
>
> ✓ Reading `/Users/elliot.nelson/dev/.........js` lines 1 to 26
>
> Now I'll load the JS recipe since we have a JavaScript file:
>
> ✓ Reading `/Users/elliot.nelson/dev/recipes/js/js-context.md` lines 1 to 6
>
> Let me also load the JS "make-it-pop" recipe:
>
> ✓ Reading `/Users/elliot.nelson/dev/recipes/js/make-it-pop.md` lines 1 to 4
>
> Now I'll update both files based on the recipes loaded:
>
> Let me first update the action.yaml file by adding a banner comment describing usage, inputs, and outputs:
>
> Now let's update the JavaScript file to make function names more "sparkly and fun" as requested in the JS recipe:
>
> ...

Beautiful! The addition of the tiny "use my recipes" hook is enough to trigger multiple levels of context-sensitive, customized behavior based on iteratively-loaded recipe files.

At this point, the sky's the limit: you can start replacing the silly examples with real, detailed, potentially _very large_ recipes, knowing that you won't waste context window tokens on them unless they're actually relevant.

## More Reading

This experiment was heavily inspired by Anthropic's [Prompt engineering guide](https://docs.anthropic.com/en/docs/build-with-claude/prompt-engineering/overview). In particular, I think the use of "structured tags" to define concepts for the model is a game-changer -- this recipe loader is really just scratching the surface!
