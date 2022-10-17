
const syntaxHighlight = require("@11ty/eleventy-plugin-syntaxhighlight");
const pluginEmbedTweet = require("eleventy-plugin-embed-tweet")

module.exports = function(config) {

  // A useful way to reference the context we are runing eleventy in
  let env = process.env.ELEVENTY_ENV;

  // Layout aliases can make templates more portable
  config.addLayoutAlias('default', 'layouts/base.njk');

  // Add some utility filters
  config.addFilter("squash", require("./src/utils/filters/squash.js") );
  config.addFilter("dateDisplay", require("./src/utils/filters/date.js") );

  // add support for syntax highlighting
  config.addPlugin(syntaxHighlight);

  // embed tweets
  config.addPlugin(pluginEmbedTweet);

  // minify the html output
  config.addTransform("htmlmin", require("./src/utils/minify-html.js"));

  // compress and combine js files
  config.addFilter("jsmin", function(code) {
    const UglifyJS = require("uglify-js");
    let minified = UglifyJS.minify(code);
      if( minified.error ) {
          console.log("UglifyJS error: ", minified.error);
          return code;
      }
      return minified.code;
  });

  config.addFilter('visibletag', (tag) => {
    return !['post', 'wip', 'publish'].includes(tag);
  });

  // debugging
  config.addNunjucksShortcode('dump', (thing) => {
    console.log(thing);
  });

  // Base site images
  //config.addPassthroughCopy('./src/site/images');
  //config.addPassthroughCopy('*.png', '*.html');

  // make the seed target act like prod
  env = (env=="seed") ? "prod" : env;
  return {
    dir: {
      input: "src/site",
      output: "dist",
      data: `_data/${env}`
    },
    templateFormats : ["njk", "md", "11ty.js", "html", "png", "js", "ico", "webmanifest", "xml", "svg"],
    htmlTemplateEngine : "njk",
    markdownTemplateEngine : "njk",
    //passthroughFileCopy: true
  };

};
