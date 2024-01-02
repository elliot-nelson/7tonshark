---
title: Applying the 3-Legged Stool to CI/CD
date: 2023-12-17
tags: [monorepo, cicd]
draft: true
---

{% image "./3-legged-stool-of-ci.jpg", "The 3-Legged Stool of CI/CD" %}

## The 3-legged stool

In a classic project management setting, the factors of Quality, Cost, and Time are depicted as legs that have inevitable relationships with each other:

 - If you want to increase quality, but can't increase time (schedule), it's going to cost more.
 - If you can't pay more, but need it faster, quality will decrease.
 - (and so on...)

The _seat_ of the 3-legged stool, for project managers, is the project itself (or, perhaps, the people implementing the project) -- either way, a project manager must assume they have little control over the project outcome other than the 3 levers represented by the legs.

If we map the 3-legged stool metaphor onto the CI/CD space, however, that assumption is no longer true. As CI/CD engineers, we have a lot of control over the tech stack used to perform our builds (the new seat of the stool). In fact, we are often striving for ways to produce the same outputs, faster, without increasing cost; or, even, to decrease both time and cost at once while keeping the outputs constant. Those outcomes are available to us only because we can identify and eliminate outstanding tech debt and inefficiencies in our build pipelines, or implement new, smarter and more efficient build processes.

## A model for metrics

It makes sense to ask: if our technical implementations have the power to change the relationships between the legs of the CI/CD stool, is it even a useful metaphor anymore? I think the answer is yes, because the mere existence of the 3 legs is a model for _what metrics we should collect to be successful_ as CI/CD engineers.

If you are already responsible for builds, you very likely have metrics and graphs for the **time** leg of your build pipeline. However, if data from the **work/output** and **cost** legs aren't also tracked and displayed front-and-center alongside the **time** leg, we don't have a full picture of the health of our build pipeline.

When producing metrics, we want all 3 legs to represent the same scope of work, so for example:

 - **Time:** The total wall-clock time from PR build triggered until PR build finished.
 - **Cost:** The total dollars spent on a single PR build.
 - **Work:** The _work performed_ by the build. This could be positive stats, like number of projects compiled and number of unit tests run, or negative stats, like number of flaky tests skipped.
 - **Tech:** It may also be useful to collect statistics _about the performance of the build pipeline itself_. As an example, projects skipped (due to change target calculation) or projects retrieved from cache (using a remote build cache) are data points that describe how the tech stack is contributing to build performance.

Representing these metrics "per build", and then averaging over a time period, is usually the most intuitive way to display these numbers. Another approach would be to show the _total number of PR builds required to merge a given PR_ -- in this case the cost would be total cost of all related builds, and the time might be the wall clock time from opening the PR to merging it.

## How to use

Next steps: -- perf -p -p erf -p -p -erf p-p -perf -p


Without data on the other 2 legs


However, for CI/CD engineers,
In comparison,

In a
In classic
## Vibes

Feels a lot like Bloodborne, with a rainy Victorian England look, but with puppets instead of werewolves. The game has a bit more story than many Soulslikes, and as a result feels very linear, progressing steadily through discrete chapters. Though there are a few classic Dark Souls style shortcuts and loopbacks unlocked throughout the game, it doesn't really affect how you play.

## Combat Feel

The game plays about halfway between Bloodborne and Dark Souls. Fable Arts, similar to Weapon Arts in Elden Ring, are different for each weapon and offer powered-up moves for dealing with difficult enemies. An interesting twist this game has is the ability to customize weapons by attaching different blades and handles, which lets you experiment with different combinations of move sets, weapon arts, and weapon types. This combined with a Sekiro-style prosethic arm that you can swap out gives you a lot of options in combat (although you'll find that some of the options are much stronger than others).

## Heavy Metal

Lies of P offers one weapon, Noblesse Oblige, that gives a respectable endgame experience: great damage, good moveset, and a hyperarmor fable art. Unfortunately, it's a club, not a greatsword, so the range is mediocre (with exception of the running jump attack). There is a weapon, Frozen Feast, that _wants_ to be this game's ultra greatsword, but in my opinion the weird moveset and fable art isn't worth it.

## Endgame

Heavy on story, the game offers 3 different endings, so playing through at least NG+2 is worth it, and during those runs you'll discover the +1 and +2 variants of armor pieces and rings typical to Souls games.

However, there's a heavy softcap on damage stats above 60 points, and increasing the NG+ level doesn't introduce any upgraded enemies or additional spawns, so the game will feel very "same" after a few playthroughs. (This could change in a future DLC though!)

## Difficulty

In my opinion, this game isn't particularly difficult. About half the boss fights allow you to summon a spectral helper which acts as a meatshield and will trivialize the fight; the ones that don't are generally the standard big, clunky boss that will feel familiar to any Souls player. (Note that the "final final" secret boss is an exception to this rule, it's actually pretty tough.)

_Note: I played this game after all the initial balancing patches, so my experience is different than those who played it on launch day._

## Multiplayer

No multiplayer of any kind.

## Verdict

Game | Vibes | Feel | Metal | Endgame | Difficulty | Multi
---  | ---  | ---   | ---   | ---     | ---        | ---
Lies of P | <center>B</center> | <center>A</center> | <center>B</center> | <center>B</center> | <center>B</center> | <center>-</center>
