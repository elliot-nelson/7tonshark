---
title: "AI Assistants & Mental Fatigue"
date: 2025-07-11
tags: [dev, ai, musings]
description: Why 5x productivity tools aren't giving us 5x output.
---

{% image "./banner.png", "Example Game Grid" %}



![alt text](/img/ai2.png)

## A productivity paradox

I've been using AI assistants like GitHub Copilot heavily for the past few months, and as I get comfortable, the results have been incredible -- on a task-by-task basis. In some cases, especially quick bug fixes and prototyping tasks, I've finished tasks 5x faster (or more!) than I would have doing my own coding and research.

But, when I look at my actual _output_ (let's say, story points per sprint), it has not increased at the same rate. In fact, so far, it has barely budged at all. There's a gap between my perceived "super-human speed" at the task level, and my overall per-week/per-sprint output.

## The "Mental Fatigue" problem

My theory here is that, while AI assistants definitely reduce the _time_ needed to solve problems, they don't always reduce the _mental energy_ required. In fact, in some cases, they require more, as you trade away relatively relaxing actions (the zen-like trance of coding up a 200-line method as it flows from your brain through your fingers) with a shorter, but much more intense and focused, action (carefully reading a 200-line method written by your assistant and checking for any defects or missing requirements).

For me personally, I've noticed a pattern where I'll be incredibly productive in the morning, knocking out several bugs and a prototype that normally would have taken me a day or longer; then, I've got some meetings to attend. But by mid-afternoon I feel mentally drained: I've got time to potentially dive into another complex problem, but I don't have the drive to spell it all out. Maybe I'll check up on my Slack threads, check the dashboards for any issues, half-heartedly start a new ticket, but I'm basically clocked out for the day.

The issue isn't the time saved - it's that I'm compressing what would have been a full day's worth of mental exertion into a few hours of intense, rapid-fire problem-solving sessions.

## Thinking Fast and Slow

I ran into this concept of "mental fatigue", and the effect it has on your ability to make quality decisions, in Daniel Kahneman's book "Thinking, Fast and Slow".

He describes two "modes" the brain operates in:

- **System 1**: Fast, automatic, intuitive, and requires little energy
- **System 2**: Slow, deliberate, analytical, and mentally demanding

Borrowing his terminology, what I've been realizing is that AI tools can shift a lot of _System 1_ thinking over to the AI -- typing up a bunch of code, or banging out some documentation, or formatting our JIRA tickets for us, all things that took our precious time but didn't demand a lot of mental energy.

But what this leaves for us is only _System 2_ thinking: carefully reading everything the AI produces, evaluating different suggestions, context switching between writing prompts and reviewing code, deciding if the work so far is both correct and complete, and so on. With no breaks for the System 1 work, our brains are in high gear for extended periods of time, burning through mental energy at an accelerated rate.

In his book, Kahneman proposed that we have a particular "capacity" for quality Sytem 2 thinking, and that capacity is affected by factors like:

- Blood glucose levels
- Sleep quality and quantity
- Time already spent on System 2 activities
- Stress and emotional state

Unlike physical fatigue, which we can often feel building, mental fatigue can hit suddenly and without warning.

## The team multiplier

Another thing I'm worried about and don't even have a handle on yet is the impact of AI assistants on team dynamics. Let's say, for example, everyone on your team is suddenly able to produce code twice as fast:

- The number of pull requests needing review doubles
- The pace of API and interface changes accelerates
- The complexity of keeping up with team progress increases

We expect a _human_ to review and sign off on every change, but we aren't adding more humans, so the current humans are expected to simply "review more" -- even though review, itself, is one of the most mentally demanding tasks we can do. It seems inevitable that team review itself either becomes a bottleneck, or continues but begins to degrade in quality ("rubber-stamping").

## Final thoughts

This isn't a hit piece on AI Assistants, as their advantages are huge: working on many languages and projects with ease, lower barrier to experimentation, faster innovation, reduced troubleshooting time, etc.

But, I think we need to be cautious about the _expected productivity multiplier of AI assistants_. I think software engineers (and software engineering teams) may need to develop new, intentional approaches to time management in order to harness our AI superpowers without accidentally burning out or overloading our teammates. And finally, I think bosses need to be patient: these are amazing tools, and every engineer needs to know how to use them, but we aren't going to turn into 5x robots overnight.
