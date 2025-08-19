---
title: "Integration Testing LLM Prompts"
date: 2025-08-19
tags: [dev, ai]
description: Using Jest snapshots to produce representative response samples for internal prompts.
banner_description: Jest snapshots for representative response samples on internal prompts.
---

{% image "./banner.png", "Integration Testing LLM Prompts" %}

Something I've been exploring is how to test the impact of changes to behind-the-scenes prompts on end-user experience. If you're baking LLMs into your product, it's not enough to go through a round of initial testing: new model versions will be released, you'll tweak your internal prompts for various reasons, and you need to have some kind of gut check on what the change in end-user experience might be.

## Snapshot testing

My favorite way to bake in integration testing results is typically with snapshot tests. You don't necessarily _know_ ahead of time what the correct response is; what you're really doing is setting a baseline. If something in the system changes that modifies that baseline, you have a chance to review the new value and decide if the change is both expected and acceptable.

> For those unfamiliar: Jest has built-in support for "snapshots", which automatically save text versions of an expected response, and will fail a test if the response does not match the saved text version. The same functionality is available in Python with pytest-snapshot or Syrupy.

Mixing in LLMs adds a new wrinkle, however. Depending on your chosen model and prompts, individual requests of the exact same input can produce very different outputs. Comparing a baseline against a constantly changing value is frustrating and makes it difficult to tell if this new diff is within the bounds of the change you normally expect, or not; what we really need is a _range of appropriate responses_.

A snapshot still works, but rather than snapshotting a _particular response_, we want to snapshot a picture of the overall stability (or instability) of the response values.

## Representative samples

The way I like to do this by collecting a representative sample. We run the same query against the LLM multiple times, then collapse matching results and come up with a list of the usual responses. This might be "100% response A" for a stable query, or "40% A, 20% B, 20% C, 20% D" for an unstable query.

You could run every query 10 times or more, but it's pretty wasteful (especially if many of your queries are stable). The strategy I like is to set a count (3), and as soon as we have any response that has been seen 3 times, we exit -- we've gotten a "majority representative sample". (I've found 3 is a good number for prompts that you expect to be mostly stable, whereas you might pick 5 or higher if you have a very unstable prompt.)

Let's make the example concrete. Let's say you're going all-in on a new music recommendation service driven by AI, and here's your core behind-the-scenes prompt:

```markdown
<system>You are a professional music reviewer and producer,
and an expert at suggesting new bands to people based on
their tastes.</system>
<user-info>Most recent artist: Silversun Pickups.
Most played artist last 7 days: Goo Goo Dolls.
Already suggested: Thick As Thieves.</user-info>
<prompt>Suggest 3 artists this user might like based on
provided information. Avoid suggesting artists already
suggested.</prompt>
<response-format>Respond to request with a JSON array of
3 artists. Format each artist as an array of two values:
a string containing the artist name, and a number from
0.0 to 1.0 representing your estimated likelihood the
user will enjoy the artist.</response-format>
```

This prompt is executed by some function behind the scenes at periodic times, it might look something like this:

```javascript
async function checkForRecommendation(user) {
	const prompt = buildPrompt(user.playHistory, user.previousSuggestions);
	const response = await queryLLM(prompt);
	const parsedResponse = parseLLMResponse(response);

	if (parsedResponse && parsedResponse[0][1] > 0.7) {
		return parsedResponse[0][0];
	} else {
		// No available recommendation or predicted score too low
		return undefined;
	}
}
```

This is the function we want to integration test -- it's "one level up" from the actual LLM request and response, it takes a user as input, and produces a string or undefined as output.

So, to produce the "stable sample" for our use case, we could write a simple wrapper function:

```javascript
// Test Helper

async function stableSample(fn, stableCount = 3) {
	const resultMap = {};

	for (;;) {
		const result = await fn();
		const resultString = JSON.stringify(result);

		if (resultMap[resultString]) {
			resultMap[resultString]++;
		} else {
			resultMap[resultString] = 1;
		}

		if (resultMap[resultString] >= stableCount) {
			break;
		}
	}

	return resultMap;
}
```

Now, to use this in a Jest snapshot, we want to make sure the result is readable. (This will be especially important in cases where your output isn't just a string but is multiple paragraphs.) To ensure we have a readable diff when the sample changes, we need a stable sample formatter.

```javascript
// Test Helper

function formatSample(results) {
	const lines = [];
	const total = Object.values(results).reduce((a, b) => a + b, 0);
	const entries = Object.entries(results);
	entries.sort((a, b) => b[1] - a[1]);

	for (const entry of entries) {
		lines.push(
			`---------- ${Math.floor((entry[1] * 100) / total)}% ----------`
		);
		lines.push(entry[0]);
	}

	return lines.join("\n");
}
```

With this custom formatting of the samples object as a raw string, the Jest snapshot file produced will contain actual newlines (instead of long chains of `\n`), dramatically improving readability in the diff.

## Writing the integration test

Let's put it all together!

```javascript
// In a manually-run integration test suite (NOT part
// of your CI/CD pipeline.)

describe("MyFeature", () => {
	describe("checkForRecommendation", () => {
		it("recommends an artist for a Silversun Pickups fan", async () => {
			const user = {
				playHistory: ["Silversun Pickups"],
				previousSuggestions: ["Thick As Thieves"],
			};
			const sample = await stableSample(async () =>
				checkForRecommendation(user)
			);
			expect(formatSample(sample)).toMatchSnapshot();
		});
	});
});
```

Now we can run the suite locally and get our first snapshot:

```javascript
exports[
	`MyFeature checkForRecommendation recommends an artist for a Silversun Pickups fan`
] = `
---------- 50% ----------
Smashing Pumpkins
---------- 25% ----------
Jimmy Eat World
---------- 25% ----------
Metric
`;
```

In this case, this is a very open-ended prompt with unstable results, so 3 is likely not high enough. And I don't think you'd ever use this, for example, to gate changes in CI/CD. It exists so that over time, as you build up integration test cases for various user personas, you can easily "re-run" your user models after subtle prompting tweaks or LLM model upgrades. Then, the diff for your changes can highlight any drastic changes in output for your user personas.

## What about evaluation frameworks?

This strategy doesn't necessarily replace tools like LangSmith that allow you to compare prompt results or evaluate prompts against sample data. I haven't personally had a chance to use those tools yet, but if AI is core to a part of your application, almost certainly you'll eventually need a team dedicated just to ensuring the quality and consistency of your prompt outputs.

But, for smaller model usage, being able to write prompt evaluation integration tests in a familiar, easily-run tool right from your terminal window feels pretty nice.
