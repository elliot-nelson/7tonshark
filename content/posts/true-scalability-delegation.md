---
title: True Scalability & Responsibility with AI
description: True scalability requires delegation of responsibility, not just tasks.
date: 2025-07-04
tags: [dev, ai, musings]
---

I was reading a blog post recently about "scaling up your productivity with AI" (I'm sure you've seen many); for whatever reason, this time the phrase really struck me. I'm increasingly convinced that AI, as we currently use it, does not truly "scale" developers. This isn't a tech problem: no matter how good the AI model becomes, it's impossible for 1 human + 1 AI to be equivalent to 2 humans.

## Delegation: Tasks vs. Responsibility

To truly scale, it's not enough to just delegate _tasks_, you also need to delegate _responsibility_ for those tasks.

Imagine a manager who runs a small development team of six people. This manager makes commitments to their customers -- perhaps "we aim for less than X defects a month" or "we address P0 bugs within 48 hours". These commitments represent the manager's responsibilities. Similarly, the individual contributors have their own lower-level responsibilities: follow best practices, run appropriate test plans, peer review changes before they merge, and so on.

But what if the manager, instead of delegating the lower-level responsibilities to the engineers, kept them all for themselves? Even with six people it would immediately be overwhelming: to be _personally_ responsible for reviewing every pull request, ensuring requirements had been followed, and so on.

When a developer uses AI assistants, they are often able to move _faster_ -- maybe twice as fast, or five times as fast, for some particular task. But they have not _scaled_, because they retain all of the responsibility for all of the work they and their AI assistant have produced, and this responsibility only grows as the amount of work grows.

## Delegation & Augmentation

I've seen a number of articles now about the shift from AI as a "tool" (increasing personal productivity for developers) to "teammate" (taking a more fundamental role within the team). In other words, AI isn't just augmenting your developer's productivity, we can actually delegate tasks to them. AI technology is moving fast, but right now, this idea feels like nonsense to me.

Do you have a _manager in your organization_ that feels comfortable _taking personal responsibility_ for the decisions their "AI employees" make? If not, no actual delegation is taking place, and AI is only augmenting the abilities of the people the manager can _actually_ delegate to (their developers).

Today, an "AI teammate" is just a fig leaf for increased scope of ownership for the human teammates, along with everything that entails (architectural knowledge, on-call shifts, code reviews, and so on). Claiming you can treat an AI like it is a coworker might be fun -- until something happens that requires true accountability and your imaginary friend is nowhere to be found.

## Takeaways

There's a hard cap to the cognitive burden humans can carry, and the amount of output you are responsible for directly increases that burden. You can probably increase a developer's speed by 10x using AI, at least temporarily. However, "10x'ing" the responsibility of a developer over the long term is going to result in engineer burnout (or silent failures).

As we continue to integrate AI into our tools and processes, we need to be mindful of the difference between acceleration and true scalability, or risk making organizational changes that aren't sustainable.
