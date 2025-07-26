#!/usr/bin/env node

const fs = require("fs");
const path = require("path");

function main() {
	if (process.argv.length !== 3) {
		console.error("Error: Please provide a single argument for the post name.");
		console.error("Usage: node tools/new-post.js <post-name-in-kebab-case>");
		process.exit(1);
	}

	const postName = process.argv[2];

	const kebabCaseRegex = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;
	if (!kebabCaseRegex.test(postName)) {
		console.error("Error: Post name must be in lower-kebab-case.");
		console.error("Example: my-awesome-post");
		process.exit(1);
	}

	// 2. Create content/posts/{name} folder
	const postDir = path.join(process.cwd(), "content", "posts", postName);

	if (fs.existsSync(postDir)) {
		console.error(`Error: Directory already exists: ${postDir}`);
		process.exit(1);
	}

	fs.mkdirSync(postDir, { recursive: true });

	// 3. Create content/posts/{name}/{name}.md file and fill it in
	const postFilePath = path.join(postDir, `${postName}.md`);

	// Generate title from kebab-case name
	const title = postName
		.split("-")
		.map((word) => word.charAt(0).toUpperCase() + word.slice(1))
		.join(" ");

	// Get current date in YYYY-MM-DD format
	const date = new Date().toISOString().split("T")[0];

	const template = `---
title: "${title}"
date: ${date}
tags: []
description: ""
banner_description: ""
---

{# {% image "./banner.png", "${title}" %} #}

## Start Writing

`;

	fs.writeFileSync(postFilePath, template);

	// 4. Exit and print to stdout the path to the newly created markdown file.
	console.log(postFilePath);
}

main();
