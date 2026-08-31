import rss from "@astrojs/rss";
import type { APIContext } from "astro";
import { render } from "astro:content";
import { experimental_AstroContainer as AstroContainer } from "astro/container";
import { getSortedPosts, postSlug } from "../../lib/posts";

export async function GET(context: APIContext) {
	const site = context.site ?? new URL("https://7tonshark.com");
	const origin = site.href.replace(/\/$/, "");
	const posts = await getSortedPosts();
	const container = await AstroContainer.create();

	const items = [];
	for (const post of posts) {
		const { Content } = await render(post);
		// Render through Astro so optimized image URLs (/_astro/…) are real,
		// then absolutize root-relative href/src so they resolve in a reader.
		const html = (await container.renderToString(Content)).replace(
			/(href|src)="\/(?!\/)/g,
			`$1="${origin}/`,
		);
		items.push({
			title: post.data.title,
			description: post.data.description,
			pubDate: post.data.date,
			link: `/posts/${postSlug(post)}/`,
			content: html,
		});
	}

	return rss({
		title: "7 ton shark",
		description: "The personal website of Elliot Nelson.",
		site,
		items,
	});
}
