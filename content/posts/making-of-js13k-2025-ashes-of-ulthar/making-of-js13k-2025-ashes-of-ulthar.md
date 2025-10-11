---
title: js13k 2025 Postmortem
date: 2025-09-27
tags: [gamedev, js13k]
description: The making of "Ashes of Ulthar", my 2025 js13k gamejam entry.
banner_description: The making of "Ashes of Ulthar", my 2025 js13k gamejam entry.
---

## Introduction

Another year, another js13k game jam!

This year the theme was "Black Cat", and my entry [Ashes of Ulthar](https://js13kgames.com/2025/games/ashes-of-ulthar) came in at **#10** overall.

{% image "./screenshot.png", "Screenshot of Ashes of Ulthar" %}

## The visuals

Early on, I knew that I wanted to make a "silhouette" game -- a graphical style where it's hand-drawn pixels, brightest color in the background, everything in the foreground drawn as silhouettes. While hunting around on the internet for inspiration I found this [green-heavy Reddit post](https://www.reddit.com/r/PixelArt/comments/z9bfn5/the_necromancers_domain/), with the multiple background layers, and I knew I wanted my game to have this same vibe.

<a href="https://www.reddit.com/r/PixelArt/comments/z9bfn5/the_necromancers_domain/">
{% image "./reddit_screenshot.png", "Screenshot of The Necromancer's Domain" %}
</a>

As in past years, I like to challenge myself to stay within a particular palette. Browsing the Lospec Palette list, I ran into a perfect little palette with similar greens, a near-black, and a nice highlight color, all in just 5 colors: [Slimy 05](https://lospec.com/palette-list/slimy-05) by [green guy](https://lospec.com/2058).

<a href="https://lospec.com/palette-list/slimy-05">
{% image "./palette.png", "Slimy 05 color palette" %}
</a>

From there, it was a matter of sitting down in Aseprite and experimenting. For fun, I've included a timelapse below from the first day to the last day. There's a lot of pieces being moved around, different buildings and effects tried, but a lot of the recognizable elements (the cat, the church, the trees) I drew in the first couple days and kept the entire time, cleaning up and polishing a little at the very end.

{% image "./terrain-in-progress.gif", "Game terrain over time" %}

There's a lot more I wanted to cram in here, of course: more buildings, more detail on the left-hand side, maybe more details for the ground or sky. But by the third week I was already trapped in size constraint limbo: any change I made was bound to affect the total zipped size, which was already capped, so I had to avoid any more touch-ups to the terrain unless I had a very good reason and was willing to pay for it somewhere else.

## Music & sound effects

I used [Sound Box](https://sb.bitsnbites.eu/) to compose the music again this year. Because I was going for a spooky, unsettling village feeling, I played around with instruments and chords off of E minor (adding 6ths, 7ths, 9ths, etc.) until it sounded good, then basically just looped it, with _very_ small adjustments (e.g. going up a 5th or a tritone) in the middle of the song -- by then I hoped the player was lost trying to keep track of their resources and read the Codex, and I wanted the music to stay in the background, just noticeable enough to add to the ambience.

> While coming up with chords I found this video, [The Scariest + Creepiest Chords AND How to Use Them](https://www.youtube.com/watch?v=-dgicW1ioP0), very useful -- I know only a little about music theory so I found myself rewinding and playing sections often as I experimented in the tracker.

One thing I really wanted to mess with this year was the time signature. To help emulate a different time signature, I changed the pattern length from the standard 32 rows in SoundBox to 28 rows, which I hoped would simulate going from 8/8 to 7/8. Then I structured my chords and drum tracks around this 7-note pattern, hoping for an effect where it always felt slightly "off", like it was going to resolve a full 8/8 bar but never did. I'm not sure if it is exactly 7/8 or not, but it was fun to play with and I'm very happy with the final result!

In past years, I had managed to squeeze in _both_ the SoundBox player (for music) and the ZzFX player (for sound effects), but this year all those pixel art backgrouns were eating a ton of space, so I decided to cut the ZzFX player and use SoundBox to make sound effects as well. I came up with a handful of useful sounds by playing with the instrument settings and assigning a track each to a sound effect, which I then used to "play" each track when I needed a sound.

This "SoundBox Sound Effects" trick worked reasonably well, and I'll probably try it again next year. It makes some sound effects (for example, a little victory trill, or drum beat, etc.) quite a bit easier to create; on the other hand, I'm not sure it's actually possible to get a ZzFX-style "jump" or "shoot" effect in SoundBox, so this technique may be less useful depending on the genre of game. I'll be experimenting with this more next year.

> If you'd like to hear the Ashes of Ulthar theme outside the game, you can use [this direct link](https://sb.bitsnbites.eu/?data=U0JveA4C7dyxbtNAHMfxv-8SJxJVkZAqVNohCyoPwFKkSgiEBBNDFQmpIAZ4g3ZBQtgYEqc4XQpi68DMyAtEYuIteBLC3dnBdupEqK1oHL6fO8e5i5X8fPZ0uWRrS-SGbLb18VC8n6EWuS47IqK_NT31Or7S-axPfAEAAAAAAAAAAItEvQxF_wjNs6Z_x3Z89z0Vi3Q--q-WY15__6-6AAAAAAAAAACoA09Ct8l4c2d9W0Tfb3h6-1f36xPvRC3FGQalVjLnyKjUirk5AAAAAAAAAACLZ3zw2GyyKw3_we20S62KdCavqwrLc_ZBMHu3QCmzbyeSrOEeAwm4ewEAAAAAAADg_zM-6Np5_ZurDf_Ri7RLDa7aef17fvWsfv3m9ZM5OwAAAAAAAAAA6mQvFHkeroisyMOsS41FOrv6WUNEW0or3zzkW7NVm9N774qtViBJtvjdrnWPXTH1nW1GrmTVHGeLqfZV6buS1Ymhe4u3Wcu80Ydz_HdPtv4-qMqZJxOZzpknE5mRsxzq4nImQSFnz5RizihvJQMZlHL2C62hG8Y852GhdVRonjFnGsvFzX_dEJnbwXTaWL00aS5Nlthgh2nrlKPSqLrxFLmonOXrPp1z-roXc5667hU5L-C6V_xMJDKfGv0JOEN8rmECAAAAAAAAUKBuDe-6KepRa23Sp7-MmhvSWvfcAfVer1-ej5w3O3n5OWeFrcdAB_wtEAAAAAAAAAD8A2oUmm14TWRj3y2o3fM91X661vnU7LaVVrp4rM5LzU7zrHPO8QLljBZoIHtVcbOAg2Lfm2zfv9RhBQAAAAAAAIDl8Rs) to open it in SoundBox.

## The villagers

Because I wanted to focus on the resource management aspect this year, I didn't want to code any typical "game math": no physics, gravity, collision detection, etc. But, I still wanted something visually interesting to be happening on screen, so I built the resource collection around villager entities actually going and retrieving resources.

Behind the scenes, every villager has a "job", which is essentially just a collection of "move from X=80 to X=120" steps. Some steps have a "cost" to pay which is associated with that job (e.g. consuming 1 meat); if you can't pay, the villager aborts and goes home. If the villager makes it to the end of their instructions and back home, they then grant the player whatever resources are associated with their job (e.g. 5 wood). When the job is complete, you get assigned your "next job" -- usually the same thing, unless the player has moved some villagers from one job to another.

(Idling villagers, by the way, still have a job -- it's just an "idle" job where you don't move at all and stand there. Conveniently, the cat's altar is tall enough to hide any villagers just standing there, and acts as the home base for villagers, whether they are idling or coming back with their resources.)

To animate the villager's journey, there's a simple heightmap of the entire screen that just says if a villager is at X=120, the "Y" of the terrain at that point is 143. This way I only have to animate one property (X), and each villager automatically "walks along the ground" on the screen, setting Y based on their horizontal location.

(Technically there are three heightmaps, since the tallowers walk in terrain layer 2 and cantors walk in terrain layer 3 -- but it all uses the same basic system.)

To avoid the "sameness" of a bunch of villagers all just moving back and forth to the exact same spot, there's some randomness built into each job, with a range of X locations you can end up at. Some jobs (like woodcutters and stonemasons) also do random "spinning around" at their target locations, to simulate work. This doesn't make sense for jobs like cantor, so the spinning is turned off for those jobs.

{% image "./villager.gif", "Villager with the Woodcutter job" %}

## Gameplay loop

Game balance! The last few days of the comp was spent constantly tweaking the costs, ambient sanity drain, and upgrade amounts, attempting to get the loop just right.

The thing is, this type of doomed resource micro-management game isn't going to appeal to everyone, and there are folks that are going to appreciate the graphics and music, lose once, and then close the game and move to the next. But for the person like me, enthralled by the min/max-ing, puzzle-box aspect of this type of game, I wanted to give a very particular experience:

 * Your first game or two should be spent bewildered, wondering if it's even possible to win the game before losing all sanity.
 * By game 2-3, if you're paying attention, you're realizing that it's probably possible to actually stabilize sanity so it doesn't drain at all -- this is the "plateau" where you can breathe a little easier and there's no more immediate threat from the sanity bar.
 * By game 5 you can stabilize every time and have probably tried to win using the ritual, only to run into the much higher sanity drain.
 * Eventually you've come up with a strategy, some combination of stacking up resources, villager sacrifices, or cantor villagers, and can easily win the game every time.

For the people this game is "meant for", I think I landed exactly where I wanted to -- a challenge that _seems_ absurd the first time you encounter it, but later that day, can be beaten with ease. The thing that changes is not levels or equipment or some new resource, only your own knowledge about how the game works.

> By the way, if you're one of those people, consider checking out [Dungeon of the ENDLESS](https://store.steampowered.com/app/249050/Dungeon_of_the_ENDLESS). It is nothing like my game, but it contains the exact "from bewilderment to mastery" feeling of satisfaction that is typical in roguelikes, and that I tried to recreate with my entry this year.

Sadly, my audience this year was probably restricted even further because I had to jettison my "help" screen for size -- a bit more explanation is often the difference between people bouncing off your game and sticking with it. I added the Help screen back for the Director's Cut edition, but I'm confident this cost me a few points in the gameplay department.

## Lessons learned

No game jam is complete without a list of the mistakes you made!

By far my biggest mistake this year was _not testing my final output_ early enough. What I did not realize during my initial setup is that I had made a game-breaking mistake in my Gulp build that only applied during the final "zipped" build (the one that has all the maximum compression settings and etc.). My day-to-day testing is always done on my "normal" build, because it's much faster and has better stack traces, and it wasn't until the final _hours_ of the competition that I realized my actual zipped build didn't load.

What's even worse is that the fix to this bug meant that missing assets were now included -- not only was my final ZIP broken the entire time, it was broken in a way that was masking almost 1KB size. So I had to find a way in just hours to cut 1KB out of the game, and I did so by replacing my sanity bar with a much more boring box and completely eliminating my Help screen.

Next year I'll make it a goal to have at least a weekly checkin where I thoroughly test my final zipped build, so that if something goes wrong I won't be sweating it in the final days of the comp.

The second lesson, and one I need to think about, is about the scoring itself. This year you can see where you ranked in individual categories, and my two _weakest_ categories were "Theme" (ranked 60) and "Controls" (ranked 48). So, next year, I'll be thinking about how to make whatever that year's theme is more integral to the game, and also how to make the controls either feel better or be better explained (a lot of that ranking, I'm afraid, is due to the removed Help screen).

## Recap

Play the game yourself:

- You can play the submitted version of this game at [https://js13kgames.com/games/ashes-of-ulthar](https://js13kgames.com/games/ashes-of-ulthar).
- The "Director's Cut" edition is available at [https://ashes-of-ulthar.7tonshark.com](https://ashes-of-ulthar.7tonshark.com/).

Check out the source code:

- The source code is available on GitHub at [https://github.com/elliot-nelson/js13k-2025-ashes-of-ulthar](https://github.com/elliot-nelson/js13k-2025-ashes-of-ulthar).

And, here are the tools I used this year:

- Code written using [VSCode](https://code.visualstudio.com/)
- Build pipeline includes [gulp](https://github.com/gulpjs/gulp), [rollup](https://github.com/rollup/rollup), and [roadroller](https://github.com/lifthrasiir/roadroller)
- Artwork created using [Aseprite](https://aseprite.org/)
- Sound effects and music created using [Sound Box](https://sb.bitsnbites.eu/)

I'm proud of this year's game and it might be my favorite game so far. As usual, many thanks to the JS13K game jam organizers, all the great folks on Twitter and Slack, and anyone who has bothered to read this far. See you next year!
