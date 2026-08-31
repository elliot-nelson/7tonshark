import { getCollection, type CollectionEntry } from "astro:content";

export type Post = CollectionEntry<"posts">;

// Non-semantic / organizational tags that should never be shown or get a page.
const EXCLUDED_TAGS = new Set([
	"all",
	"nav",
	"post",
	"posts",
	"publish",
	"example",
]);

/** Filter a tag list down to display-worthy, semantic tags. */
export function visibleTags(tags: string[] = []): string[] {
	return tags.filter((tag) => !EXCLUDED_TAGS.has(tag.toLowerCase()));
}

/** Every semantic tag with its post count, sorted by count then name. */
export async function getTagsWithCounts(): Promise<
	{ tag: string; count: number }[]
> {
	const posts = await getSortedPosts();
	const counts = new Map<string, number>();
	for (const post of posts) {
		for (const tag of visibleTags(post.data.tags)) {
			counts.set(tag, (counts.get(tag) ?? 0) + 1);
		}
	}
	return [...counts.entries()]
		.map(([tag, count]) => ({ tag, count }))
		.sort((a, b) => b.count - a.count || a.tag.localeCompare(b.tag));
}

/** Map a collection entry id to its URL slug (folder-per-post -> folder name). */
export function postSlug(post: Post): string {
	return post.id.replace(/(^|\/)index$/, "");
}

/** All posts, newest first. Drafts hidden in production only. */
export async function getSortedPosts(): Promise<Post[]> {
	const posts = await getCollection("posts", ({ data }) =>
		import.meta.env.PROD ? !data.draft : true,
	);
	return posts.sort((a, b) => b.data.date.valueOf() - a.data.date.valueOf());
}
