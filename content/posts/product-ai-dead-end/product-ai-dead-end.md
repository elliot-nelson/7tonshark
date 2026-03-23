---
title: Is Product AI a dead end?
date: 2026-03-23
tags: [ai, musings]
description: 'That AI-Powered Focused Inbox feature in your Outlook? Why would anyone use it when their customized Personal AI can organize their inbox exactly the way they want, ten times more effectively, learning at a rate that will be impossible for Product-style AIs.'
banner_description: Personal AIs will leave Product-style AI in the dust.
---

{% image "./banner.png", "Is Product AI a dead end?" %}

An unconstrained Opus, with nothing but a bash shell, is better at talking to Jira than a constrained Opus with a Jira MCP tool. With a handful of tools like `curl`, `jq`, maybe some pipes and inline `node` or `python` scripts, and a few failed attempts and internet searches later, Opus has already mastered the API of any product that it can access. Not only that, it can combine these tools in new ways to accomplish its goal, ways that the creators of an MCP tool haven't even dreamed of yet.

This scrappy, inventive, goal-driven version of Opus is Personal AI -- the consumer stuff like Cursor, Claude Code, and ChatGPT. The other camp, the more constrained Product AI, is the stuff built into your software -- the personalized recommendations inside your music apps, and the popups in Canva and PowerPoint offering to help you design your slideshow.

Personal AI is essentially unconstrained; give it access to your local folder, a bash shell, and access to the internet, and a bleeding-edge model like Opus can learn to do anything, surprisingly fast, in the span of a single session. In contrast, prompt engineering, context stuffing, RAG lookups, and MCP servers -- the lifeblood of Product AI -- all exist to enforce constraints on what the AI will think about, or act on. (After all, you can't have a company's chatbot revealing API tokens, or offering unwanted personal advice to customers.)

This capability gap between constrained and unconstrained models is going to be exponential. Each new model generation is not only better at reasoning and task management, but at managing feedback loops themselves; the stronger and tighter the feedback loop, the faster the model can learn. In another generation or two, even with the same underlying model, Personal and Product AI will be in different leagues. That AI-Powered "Focused Inbox" feature in your Outlook? Why would anyone use it when their customized Personal AI can organize their inbox exactly the way they want, ten times more effectively, learning at a rate that will be impossible for Product-style AIs.

Now, MCP servers and RAGs and prompts and all that other stuff is just software, so you could argue that enterprise can "level up" just as fast: just like software engineers at Anthropic use Claude Code to work on Claude, you can use AI to improve your own AI frameworks and tooling. But unlike personal AIs, product builders have a dilemma. If you build in AI-only continuous feedback loops, allowing them to improve your framework without human intervention, you've given up the safety you were paying for -- and it's still just Personal AI with extra steps. Meanwhile, if you're dedicated to keeping that human in the loop, testing and deploying new versions of your prompts and MCP tools, you'll never catch up to the Personal AI: the feedback loop is just too slow.

I'm convinced the race by all software companies to add AI to their products is a dead end. The inevitable endpoint of LLM evolution is personalized AI-powered extensions of our own thought processes -- whether that's via chat, voice, or something even more sci-fi, we don't know yet. In this world, the AI features embedded in our software products will never be anything but an annoying distraction for us to turn off, so our _actual_ AI can organize our calendar and doordash lunch for us.
