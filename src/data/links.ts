export interface Link {
	title: string;
	url: string;
	/** Optional author / attribution. */
	by?: string;
	/** Optional URL for the author. */
	byUrl?: string;
}

// Curated links around the web. Add a new one by appending to the array.
export const links: Link[] = [
	{
		title: "Everyone should know SIMD",
		url: "https://mitchellh.com/writing/everyone-should-know-simd",
		by: "Mitchell Hashimoto",
	},
	{
		title: "The Door Problem",
		url: "https://lizengland.com/blog/the-door-problem/",
		by: "Liz England",
	},
	{
		title: "Where's the Shovelware? Why AI Coding Claims Don't Add Up",
		url: "https://mikelovesrobots.substack.com/p/wheres-the-shovelware-why-ai-coding",
		by: "Mike Judge",
		byUrl: "https://substack.com/@mikelovesrobots",
	},
	{
		title: "The Configuration Complexity Clock",
		url: "https://mikehadlow.blogspot.com/2012/05/configuration-complexity-clock.html",
		by: "Mike Hadlow",
		byUrl: "https://twitter.com/mikehadlow",
	},
	{
		title: "I Will Fucking Piledrive You If You Mention AI Again",
		url: "https://ludic.mataroa.blog/blog/i-will-fucking-piledrive-you-if-you-mention-ai-again/",
		by: "Nikhil Suresh",
	},
	{
		title: "Developer Productivity Engineering Handbook",
		url: "https://storage.pardot.com/68052/1692821408aLLjn0mS/DPE_Handbook_2022__7_.pdf",
		by: "Gradle Enterprise / Develocity",
	},
	{
		title: "LinkedIn DPH Framework",
		url: "https://linkedin.github.io/dph-framework/",
	},
	{
		title: "Gwern.net",
		url: "https://gwern.net/",
		by: "Gwern Branwen",
	},
	{
		title: "A Criticism of Scrum",
		url: "https://www.aaron-gray.com/a-criticism-of-scrum/",
		by: "Aaron Gray",
	},
	{
		title: 'CSS Utility Classes and "Separation of Concerns"',
		url: "https://adamwathan.me/css-utility-classes-and-separation-of-concerns/",
		by: "Adam Wathan",
	},
	{
		title: "Partial and shallow clones in git",
		url: "https://github.blog/2020-12-21-get-up-to-speed-with-partial-clone-and-shallow-clone/",
		by: "Derrick Stolee",
		byUrl: "https://twitter.com/stolee",
	},
	{
		title: "Dungeonomics",
		url: "https://www.projectmultiplexer.com/category/dungeonomics/",
		by: "Emily Dresner",
		byUrl: "https://twitter.com/multiplexer",
	},
	{
		title: "V8 function optimization",
		url: "https://erdem.pl/2019/08/v-8-function-optimization",
		by: "Kemal Erdem",
		byUrl: "https://twitter.com/burnpiro",
	},
	{
		title: "Are We Really Engineers?",
		url: "https://www.hillelwayne.com/post/are-we-really-engineers/",
		by: "Hillel Wayne",
		byUrl: "https://twitter.com/hillelogram",
	},
	{ title: "js13kgames", url: "https://js13kgames.com/" },
	{ title: "Aseprite", url: "https://www.aseprite.org/" },
	{ title: "Tiled", url: "https://www.mapeditor.org/" },
];
