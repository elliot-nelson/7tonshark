module.exports = {
	tags: [
		"posts"
	],
	"layout": "layouts/post.njk",
	"permalink": "posts/{{ page.fileSlug | slug }}/"
};
