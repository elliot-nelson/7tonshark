---
title: The illusion of internal platforms
subtitle: Internal customers aren't the same as external customers, and neither are the platforms we build for them.
description: Internal customers aren't the same as external customers, and neither are the platforms we build for them.
xtweets: ['1609965125053845505']
date: 2023-01-08
tags: [publish2, dev2]
---

In large companies, it's natural for teams to develop around a particular library or internal service. Often there's a temptation for these teams to treat their own library, or service, or API, as a "platform" -- a product to be consumed by their internal customers, just like an external customer would consume an API. In fact, the comparison is often explicit... "it's just like Stripe, or Twilio, but it's internal instead of external".

On the surface, this sounds like a reasonable argument, but there's a big difference between an internal customer and an external customer. As a company scales out, the strategies that work well for external customers turn out to be a huge burden for internal customers.

### Platforms: the ideal vs the reality

Imagine a team of a dozen or so software engineers, in charge of a domain-specific component -- maybe it's a billing API used by multiple web portals the company supports, or a home-grown user interface library built on top of React that all sites at the company make use of.

As the company expands, and the number of other teams using the component grows, the team decides that they aren't just a component used by these various websites -- they're building a _platform_. It'll be a good platform, too, with a well-defined API, semantically versioned, with a regular release cycle. All these other teams in the company are now their customers. _("Just like Stripe, but internal!")_

The fundamental problem: this is **good** for the team, but it's **bad** for the company overall. Although probably well-intentioned, what this strategy actually does is turn the team into a dozen-engineer startup company floating inside the larger company. Every time they push out a new release, it's the job of their "customers" to update to that version and get the latest features... but these hidden costs (the engineering hours to get the latest update) are not included in the cost and benefit analysis of their own team, because it's not a cost that they need to pay.

Every day, this team makes decisions -- to update this dependency, to not update that dependency, to make minor changes to this field or that response format -- that can have big ramifications for their various consumers. As the number of internal consumers grows, the _true cost_ of these decisions grows as well, scaling as the company scales. The point of building the platform was to consolidate expertise and support an endless array of internal customers at no additional cost, but in practice, the company experiences the opposite -- each additional internal customer means additional engineering hours.

Why does this happen?

### A shift in responsibility

The issue in the example above isn't the concept of consolidating expertise, it's just that it wasn't applied broadly enough. In order for a company to scale users of the API, but with a fixed cost, the team needs to be responsible not just for _providing_ the new version, but also _upgrading all their customers_. In other words, they don't just own the API, they own the integration point with that API within every consumer as well.

For a team modeling itself on the Stripes and Twilios of the world, this assertion is absurd -- it would be impossible for Stripe to waltz into every customer's codebase, with their many and varied applications, and put up pull requests. Luckily, it turns out this isn't a good comparison after all, because internal customers **aren't customers!** They are _coworkers_, working for the same company, and (hopefully) with the same goals.

Instead of imagining Stripe, imagine instead a shared monorepo; the type you'd find at Google, or Facebook. Now the assertion doesn't sound so absurd; in fact, it's probably _required_, because presumably all of those consumers (that also live in the monorepo) have compilation steps, and unit tests. If you make breaking changes to your API, you won't even be able to merge your changes until you've fixed all the calling services so they compile and pass their unit tests.

This expansion of responsibility brings the incentives of the team more in line with the rest of the company, because now that _true cost_ from above is something they pay -- choices they might have made before because they were easy to make will now be avoided, because of the churn they would cause in the rest of the codebases they support.

> This doesn't mean that you need your company's code to live in a monorepo; the shift above is a change in attitude and expectations, more than tech. Although it turns out that by their nature, monorepos do tend to encourage this type of thinking!

### What about external customers?

So what is the difference between an internal and an external customer?

It's about incentives.
