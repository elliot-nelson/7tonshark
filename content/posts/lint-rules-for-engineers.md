---
title: Lint rules should help engineers, not just programmers
date: 2024-07-16
tags: [dev, musings]
---

I'm a huge fan of linters and static code analysis in general, but there's a specific class of rules that bug me to no end.

In [Software Engineering at Google](https://abseil.io/resources/swe-book), they distinguish the concepts of _programming_ and _software engineering_ by suggesting that programming is writing code, whereas software engineering is writing code over time. Programming requires a lot of knowledge _about computers_: providing the proper instructions, understanding how quick or slow an algorithm is, how the code will interact with other systems. Software engineering, in constrast, requires programming knowledge _and_ thinking about how long this code will survive in production, how many other team members will work on it, how it is likely to change over time, how easy or difficult it is to test after it is changed, and so on.

In my opinion, there are lint rules that focus too much on what code happens to do _right now_ -- a potentially transient state that is not very relevant in the full lifespan of that particular function -- rather than allowing the engineer to express the _intent of the code_, a thing that survives the entire lifespan.

## The "prefer-const"

A prime example (and one that I find most people disagree with me on!) is this chestnut from eslint:

> prefer-const
>
> Require const declarations for variables that are never reassigned after declared.

Whether a variable is assigned once, or twice, is often simple happenstance. If I create a temporary variable `weight`, which I _intend_ to be assigned several times, but the current function is simple enough that it doesn't _need_ to be updated yet, I really don't want to change that variable to `const`; this changes the _intent_ of the code.

```js
function getAverageWeight() {
	const multiplier = this.getWeightFactor();
	let weight = this.baseWeight;

	// TODO: Apply weight variances

	return weight;
}
```

The claim that `multiplier` and `weight` should be the same, merely because I happen to use them the same _right now_, optimizes for programming, rather than software engineering. If the needs of the programmer and the needs of the software engineer conflict, I believe we should favor the software engineer's side, and ensure that the intent remains.

> I know the argument here is always "well, if it's not const, someone might assign a value to it, and that could introduce new bugs". This argument has _always_ made me scratch my head; unless your function is 500 lines long (which is its own problem), or has no unit tests (again, its own problem), I just don't think this argument holds any water.

## Require 3 case statements

Another example, this time from the default TypeScript ruleset for SonarCloud:

> Rule: “switch” statements should have at least 3 “case” clauses

Again, the linter is evaluating the needs of the code as-is (which happens to have less than three cases _right now_), rather than the needs of the code _over time_. The engineer who wrote the code has decided to use a switch statement (a somewhat unusual choice in modern TypeScript, I find); the logical conclusion to the reader is that this is because there _may be several values_ to choose from, and that it's likely that number could _grow over time_. It provides an obvious framework in which to work in for future maintainers of this code.

The idea that a contributor might take their explicit author intent, and throw it away just to satisfy a lint rule as arbitrary as this, is just maddening to me.

## You don't need regex here

Here's a very annoying example from the Prometheus linter, pint:

> promql/regexp:
>
> This check will warn if metric selector uses a regexp match but the regexp query doesn’t have any patterns and so a simple string equality match can be used. Since regexp checks are more expensive using a simple equality check if preferable.

Seems reasonable, right? Why use a regular expression check if a simple equality check would suffice?

How about: trust me! As a software engineer, I'm not writing _one_ PromQL query, I'm writing dozens, and I expect hundreds to be added in the future by other team members. I've got a clear template to copy and paste, some of which have wildcards in them, and some of which do not. This type of lint rule forces me to bend over backwards and break my template: either I now need to make everything more complex by making _both_ the check value and the check operator configurable, _or_ I need to start inventing clever ways to make regular strings "look like" regular expressions.

## Tell me when I'm wrong!

I'm still all about most lint rules. Warn me when the code I wrote won't work. Warn me when the code I wrote will do something different than the average reader would expect. Warn me when I might have a type incompatibility. Warn me when I write an obvious typo or use a deprecated language feature.

But, don't warn me anymore about code I'm writing that _could_ be written differently. I meant it to be this way.
