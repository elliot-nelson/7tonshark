---
title: Optimizing for Space Part 2
tags: [javascript, js13k, gulp]
excerpt: >-
  Adventures in eliminating bytes: make your zip files even smaller by eliminating
  extra files altogether.
redirect_from:
  - /optimizing-for-space-2/
---

## Adventures in eliminating bytes

In the quest for smaller and smaller zip files, one important tool is eliminating
extra files altogether. Every file in the zip has an overhead of around 88 bytes - more
depending on the length of the filename. This is a significant cost, and it's one reason
a sprite sheet is so valuable (crunching all your PNGs into one PNG, for example).

Let's ignore images for a second, though, and think about just our core files - in a typical
game, this is your `index.html`, your `.css` file, and your `.js` file.

```html
<html>
<head>
    <link rel="stylesheet" type="text/css" href="app.css">
</head>
<body>
    <script type="text/javascript" src="app.js"></script>
</body>
</html>
```

```css
html, body {
    margin: 0px;
    padding: 0px;
    background-color: black;
}
```

```js
console.log('Initializing a game...');
```

We'll tie all this together with our gulp build:

```js
// gulpfile.js

function html() {
    return gulp.src('src/*.html')
        .pipe(htmlmin({ collapseWhitespace: true }))
        .pipe(gulp.dest('dist'));
}

function css() {
    return gulp.src('src/*.css')
        .pipe(cleancss())
        .pipe(gulp.dest('dist'));
}

function js() {
    return gulp.src('src/*.js')
        .pipe(terser())
        .pipe(concat('app.js'))
        .pipe(gulp.dest('dist'));
}

module.exports = {
    build: gulp.parallel(html, css, js)
};
```

So, we seem to have the basics down - we're minifying all our source files and dumping
them into a folder. Let's add a zip step, using advzip to crush the output zip file even
further, and add some size lines so we can get measurements:

```js
function final() {
    return gulp.src('dist/**')
        .pipe(size({ title: 'Files' }))
        .pipe(zip('final.zip'))
        .pipe(size({ title: 'Zip (Before)' }))
        .pipe(advzip({ optimizationLevel: 4, iterations: 1000 }))
        .pipe(size({ title: 'Zip (After)' }))
        .pipe(gulp.dest('.'));
}

module.exports = {
    build: gulp.series(gulp.parallel(html, css, js), final)
};
```

And the build:

```text
[14:16:28] Files all files 235 B
[14:16:28] Zip (Before) all files 486 B
         486         484  99% final.zip
         486         484  99%
[14:16:29] Zip (After) all files 484 B
```

Well, in this case the zip file is actually bigger than the source files, but that's
to be expected with our tiny example files (the per-file overhead is bigger than our
actual content). Let's see how we can reduce it.

## Inlining our CSS

{: .notice--info }
You might be wondering why we're bothering with CSS at all; for a canvas-heavy game,
you may be able to ignore it altogether. Not every game is based on canvas, though,
and if you make use of CSS animations and HTML elements, you might actually have quite
a bit of CSS to manage.

Let's start with the obvious: discard the CSS file, and insert the content inline
into our HTML.

```html
<html>
<head>
    <style type="text/css">
        html, body {
            margin: 0px;
            padding: 0px;
            background-color: black;
        }
    </style>
</head>
<body>
    <script type="text/javascript" src="app.js"></script>
</body>
</html>
```

In HTML5, the `type=text/css` attribute is now optional, so let's just get rid of it.

```html
    <style>
        ...
    </style>
```

Last, since we're cutting out our `cleancss` step, we want to make sure the inline CSS
will be minified. Luckily the `htmlmin` plugin provides an option for exactly that:

```javascript
function html() {
    return gulp.src('src/*.html')
        .pipe(htmlmin({ collapseWhitespace: true, minifyCSS: true }))
        .pipe(gulp.dest('dist'));
}
```

Build!

```text
[14:25:37] Files all files 196 B
[14:25:37] Zip (Before) all files 365 B
         365         360  98% final.zip
         365         360  98%
[14:25:37] Zip (After) all files 360 B
```

Looking good, that's 124 bytes off the top. This is kind of a sad trade-off if your game uses
a lot of CSS, though: inlining all that CSS is uglier to work with, prevents you from calling
`cleancss` with your own custom options, and doesn't let you use plugins like `gulp-sass`.

A potential solution is to rearrange our build to keep the CSS content in its own file, but
then _insert_ it into the finished HTML, using `gulp-template`.

```html
<html>
<head>
    <style><%= css %></style>
</head>
<body>
    <script type="text/javascript" src="app.js"></script>
</body>
</html>
```

You'll notice the new ERB/JSP-style "tag" here, a placeholder for our CSS content. Let's update
our gulpfile to process our CSS files first, placing them in a temporary location, which we can
then read in using the standard `fs` module.

```javascript
function css() {
    return gulp.src('src/*.css')
        .pipe(cleancss())
        .pipe(gulp.dest('temp'));
}

function html() {
    const cssContent = fs.readFileSync('temp/app.css');

    return gulp.src('src/*.html')
        .pipe(template({ css: cssContent }))
        .pipe(htmlmin({ collapseWhitespace: true }))
        .pipe(gulp.dest('dist'));
}

module.exports = {
    build: gulp.series(css, gulp.parallel(html, js), final)
};
```

Running this build produces the exact same size, but now we can organize our CSS content however
we wish, including additional style-related plugins.

## Inlining our Javascript

Now that we've done it for CSS, it seems pretty obvious: why not do it for our game code? We're
already minifying it into an unreadable ball, we might as well insert it into the HTML as well.

{: .notice--info }
In past iterations of HTML/XHTML, you may have worried about encoding characters you'd encounter
within your source code. In HTML5, the _only_ magic string you need to worry about is `</script>`.
It's very unlikely you have the string `</script>` anywhere in your game logic, so feel free to
insert as much JavaScript as you want.

```html
<html>
<head>
    <style><%= css %></style>
</head>
<body>
    <script type="text/javascript"><%= js %></script>
</body>
</html>
```

Don't forget to update the gulpfile to run _both_ CSS and JS before the HTML step.

```javascript
function js() {
    return gulp.src('src/*.js')
        .pipe(terser())
        .pipe(concat('app.js'))
        .pipe(gulp.dest('temp'));
}

function html() {
    const cssContent = fs.readFileSync('temp/app.css');
    const jsContent = fs.readFileSync('temp/app.js');

    return gulp.src('src/*.html')
        .pipe(template({ css: cssContent, js: jsContent }))
        .pipe(htmlmin({ collapseWhitespace: true }))
        .pipe(gulp.dest('dist'));
}

module.exports = {
    build: gulp.series(gulp.parallel(css, js), html, final)
};
```

And, build!

```text
[14:44:12] Files all files 183 B
[14:44:12] Zip (Before) all files 258 B
         258         255  98% final.zip
         258         255  98%
[14:44:12] Zip (After) all files 255 B
```

Again, another 105 bytes off the top.

## Optimizing our HTML

We're down to a single HTML file, so there's not much more we can do, except take a look at
the HTML itself. Our HTML is pretty simple, but since this is HTML5 and we're running in
modern browsers, pretty much every one of these tags is optional (or, more accurately,
the browser is smart enough to insert them itself, in the right place in the DOM, if
they're missing).

Let's go ahead and cut the `<html>`, and the `<body>` too. And the `<head>`. And, since
`text/javascript` is the _default script type_ in HTML5, let's cut that too! That leaves us
with the following HTML page.

```html
<style><%= css %></style>
<script><%= js %></script>
```

And build:

```text
[14:49:57] Files all files 121 B
[14:49:57] Zip (Before) all files 225 B
         225         222  98% final.zip
         225         222  98%
[14:49:57] Zip (After) all files 222 B
```

There you have it. We've managed to crush our final zip file size from the original 484 bytes
down to 222 bytes, a savings of 262 bytes of overhead.

{: .notice--info }
Note that we express this savings in terms of _bytes of overhead_, and not a percentage. For
our silly example, this was a savings of *~45%*, but that's not relevant because these space
savings won't scale as we add the actual game logic - it'll stay roughly 262 bytes off the
top. So, you can probably save this type of optimization for very late in the process, when you're
trying to cram that last sprite into your game.

## Using existing plugins

Gulp has a great plugin ecosystem, so chances are if you're trying to do something, someone
has already written a plugin for it. The functionality we wrote into our gulpfile above
can actually be accomplished out-of-the-box with the [gulp-inline-source](https://www.npmjs.com/package/gulp-inline-source)
plugin.

Using the plugin, our HTML would look like this.

```html
<link rel="app.css" inline>
<script src="app.js" inline>
```

The plugin then automatically finds those files in your gulp sources and inserts them as
appropriate. For most cases, this should give you everything you need! If you want
exact control of the final output, though, then the template approach we developed above is ideal.
