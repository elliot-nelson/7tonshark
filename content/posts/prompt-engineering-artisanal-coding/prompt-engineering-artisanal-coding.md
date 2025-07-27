---
title: Is prompt engineering the new artisanal coding?
date: 2025-07-16
tags: [dev, ai, musings]
description: "LLMs aren't just a new layer of abstraction. The best way to describe what you intend to build, and how to build it, will continue evolving for years to come -- which means prompt engineering has the potential to be the most \"hand-crafted\" discipline of all."
banner_description: "LLMs aren't just a new layer of abstraction: they are a brand new playing field for \"hand-crafted\" code."
---

{% image "./banner.png", "Is prompt engineering the new artisanal coding?" %}

Vibe Coding. Prompt Engineering. I find most folks who hear these words tend to feel either excitement or dread. Either this is the demise of "real" programming, where coding _artists_ applied their craft to produce works of art, and now we are doomed to maintaining endless lines of half-baked slop produced by unreliable LLMs; or, this is the new golden age of programming, where anyone can build entire applications in minutes by whispering a few words into a waiting AI chat box.

I recently ran into a great post, [Real™ Programmers: 1960–1970](https://medium.com/hackernoon/the-second-decade-of-programming-all-about-real-programmers-2556758b5e51), which retells the story of a "bare metal" programmer that was posted on Usenet back in 1983.

Mel was a programmer in an era where programmers were transitioning from writing direct machine code in hexadecimal, to writing variants of assembly language that could be compiled down to machine code. (This was before the explosion of C in the late '70s and early '80s, a _comparatively_ high-level language, with its own true compiler.)

Of course, Mel did not _trust_ the output of the assembly language compilers, because his own machine code was faster and better optimized, and the compiler couldn't take advantage of the same tricks that he could -- tricks that required detailed knowledge about the behavior of the computer his program ran on, and the timing and behavior of his specific program.

This same complaint would ring out in many Usenet posts a decade later as assembly language experts complained about the output of the first C compilers. Old-timers would ridicule newer programmers, complaining that they would just blindly compile their programs and run them, without even reviewing the assembly language output for mistakes or missing optimizations.

(Starting to sound familiar?)

## Structure & the Death of the Artist

For about a decade (2005-2015), I worked for a number of startups, and (not coincidentally) did most of my coding in Ruby. This was a heyday for Ruby and Ruby on Rails, and a big part of the engineering culture in these circles was a focus on "hand-crafted" software. Some software was _good_, and some was _bad_: we Ruby programmers were dedicated to writing only the former. (Of course, whether a piece of software was _good_ or _bad_ was completely unrelated to whether it could make any money. This disconnect between art for art's sake and true business value might be one reason you tend to find Ruby mostly in startups and smaller companies.)

I think Ruby encourages this "artisanal coding" attitude, in part because it is so _expressive_, and has such a large standard library, that there are often 5 different clever ways to express an idea. Some intersection of cleverness, readability, and future maintainability dictates the _best possible version_ of the code (the subject of much debate).

_Structure_, in all its forms, tends to stamp out this attitude. At the language level, this structure comes in the form of hidden details: the steady climb from machine code, to assembly language, to C, to Golang, hides more and more complexity from the programmer. In parallel, across all languages, we develop structure in the form of patterns: the patterns of imperative, or functional, or object-oriented programming, and the common "design patterns" like singletons, factories, observers, and so on.

Building working, reliable software in a large company today almost _never_ feels like artistry: by the time you are writing the code, assuming previous steps (identifying requirements, laying out the broad components, and so on) were done properly, there's very little debate about what the code will look like. Of course there are still many ways to write _bad_ code -- that is, not performant, or not stable, or not maintainable -- but if the code is _good_, it tends to be about the same regardless of who wrote it.

## Compilers & Emergent Behavior

If you look at LLMs as just the "next layer" in the many layers separating programmers from our software's eventual running machine code, you would assume not much changes. It's just the next compiler! Newer versions will write better code and make fewer mistakes, we'll get more comfortable with this new way of creating software, and like many iterations of programmers before us, we'll get used to a new status quo.

Here's the thing, though: LLMs are _not compilers_. They are complex systems with emergent behaviors, almost nothing like programs written by humans. LLMs have more in common with ant colonies and weather systems and microorganisms than they do computer software: we can observe them, we can even train them, but we barely understand how they work.

If you could simply describe to an LLM what you wanted and it reliably produced it, the concept of "prompt engineering" would not exist at all. It exists precisely because LLMs _aren't_ reliable, and there's an art form -- a brand new art form that we are only scratching the surface of now -- to convincing it to produce most of what you want, most of the time.

## The New Artists

If, like me, you sometimes yearn for days of yore, where you were focused on the perfect 19 lines of optimized assembly in your inner game loop, or the most efficient way to implement a particular algorithm in Python, _don't lose all hope_.

I believe that ten years from now, the _lines of code_ in the software we produce are going to be irrelevant to most software engineers. But, unless there are big breakthroughs in the science of complex systems and chaos theory, we'll be no closer to truly understanding the behavior of the large-language models we use to write that code. The best way to describe what you intend to build, and how to build it, will continue evolving for years to come -- which means prompt engineering has the potential to be the most "hand-crafted" discipline of all.
