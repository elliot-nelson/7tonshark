---
title: Optimizing for Space
tags: [javascript, js13k]
date: 2018-10-08
alias:
- /2018-10-08/optimizing-for-space/
---
In the [js13kgames competition](http://js13kgames.com), you have 30 days to produce a game that can be
bundled into a ZIP file of no more than 13,312 bytes. If you find yourself frequently running into this
limit, here's a collection of tips and tricks that might help.

## 1. Minify your game files

This is the obvious one, and usually the first thing to tackle.

Most games are going to include one or more javascript files, a single HTML file, one or more CSS files (optional), and
then some assets (usually images). All of these files have minification options available:

 - For HTML, [htmlmin](https://www.npmjs.com/package/htmlmin)
 - For CSS, [clean-css](https://www.npmjs.com/package/clean-css)
 - For images, [imagemin](https://www.npmjs.com/package/imagemin)
 - For javascript, [terser](https://www.npmjs.com/package/terser) (or possibly [uglify](https://www.npmjs.com/package/uglify), if targeting ES5)

If you're using a gulp-based build system, you can use the gulp wrappers for all of these. A basic `gulpfile.js`
that includes the tools above might look something like this:

``` js gulpfile.js
const gulp     = require('gulp');
const terser   = require('gulp-terser');
const imagemin = require('gulp-imagemin');
const cleancss = require('gulp-clean-css');
const htmlmin  = require('gulp-htmlmin');

gulp.task('build:html', () => {
    gulp.src('src/*.html')
        .pipe(htmlmin())
        .pipe(gulp.dest('out'));
});

gulp.task('build:css', () => {
    gulp.src('src/*.css')
        .pipe(cleancss())
        .pipe(gulp.dest('out'));
});

gulp.task('build:images', () => {
    gulp.src('src/*.png')
        .pipe(imagemin())
        .pipe(gulp.dest('out'));
});

gulp.task('build:js', () => {
    gulp.src('src/*.js')
        .pipe(terser())
        .pipe(gulp.dest('out'));
});

// "gulp build" means build everything
gulp.task('build', ['build:html', 'build:css', 'build:images', 'build:js']);

// "gulp watch" watches for changed files and then runs just the approprate step
gulp.task('watch', () => {
    gulp.watch('src/*.html', ['build:html']);
    gulp.watch('src/*.css',  ['build:css']);
    gulp.watch('src/*.png',  ['build:images']);
    gulp.watch('src/*.js',   ['build:js']);
});

// "gulp" builds everything and then starts watching
gulp.task('default', ['build', 'watch']);
```

Before doing anything else to optimize for space, make sure you have a basic pipeline like this in place. The
out-of-the-box minifiers will shave a significant amount off of your image and javascript file sizes.

{% note %}
The example above just copies all the javascript files, minified separately. You typically don't want
this, instead you want a single output javascript file included by your `index.html`. A simple, popular way
to do this is to insert a `gulp-concat` step to smash all your javascript files into one. You may prefer using
one of the packers, like [webpack](https://webpack.js.org/), [rollup](https://rollupjs.org/guide/en), or
[parcel](https://parceljs.org/), but be conscious of shims and boilerplate code - see suggestion #7 below.
{% endnote %}

## 2. Use eslint to spot unnecessary code

With the naked eye, it can be hard to pick out variables or properties you ended up not using. Consider
adding `eslint`/`gulp-eslint` to your project to help flush those things out.

If you want to focus just on saving space, you only need to turn on a few rules in your eslintrc:

- For spotting code you ended up not needing, turn on `no-unused-expressions`, `no-unused-vars`.

- For spotting code you could shorten, try `prefer-arrow-callback`, `prefer-destructuring`, `prefer-spread`,
and `prefer-object-spread`.

- Don't bother with `quotes` or `prefer-template`, as terser is smart enough to rewrite all your strings
to make them as small as possible (including eliminating unnecessary string concatenation).

- Consider `no-var`. More generally, you should pick _only one_ of `var`, `let`, and `const`, and use it
exclusively: I recommend `let`. This will save you exactly 8 bytes in your zip file, since the keywords
`const` and `var` will never exist in the output source code.

{% note %}
**Tip:** It's worth taking a second to consider the nature of a ZIP file itself, which is basically
a collection of files compressed with Huffman encoding. What this means is that everything in your
zip file is turned into a dictionary of commonly used phrases, and your files are stored as references
to those dictionary entries, with the most commonly used entries organized to take the least amount
of bits to reference. <br><br>Optimizing for space has a certain "all or nothing" aspect
to it. If your code has 500 calls to `game.updatePlayer()`, then these references will be optimized
during compression to take up next to no space: reducing the 500 calls to 5 calls may save you next
to nothing, or even _increase_ the size of your zip file! However, reducing it to 0 calls guarantees
that you will lower the total size by at least the number of bytes it takes to store a single copy
of the string.<br><br>This is why mangling is so powerful, because it removes all copies of the
original names - see suggestions #6 and #8 below.
{% endnote %}

Feel free to turn on whatever other eslint rules you like based on your own preferences. The ones
above are the most likely to save you space, but other rules can still be helpful in keeping your
code clean and/or finding potential bugs.

## 3. Use sprite sheets

As far as bang for the buck goes, if you have any images at all, this is a big one.

A "sprite sheet", if you've never seen the term, is just a bunch of smaller images
combined into a single image file, usually in a grid. (Although if
you're willing to keep track of the locations of each image, you can pack sprites
of different sizes into a sprite sheet as tight as you can get them.)

Even with just a simple grid, though, the savings can be huge. For a concrete
example, check out these 3 simple sprites for an imaginary game involving missiles
and frogs:

![example sprite sheet](spritesheet.png)

```text
# 3 Separate 64x64 PNGs (after minifying)

150    player.png
174    missile.png
196    enemy.png

# 1 Combined 192x64 PNG (after minifying)
328    spritesheet.png
```

Just by combining our images into a single image, we cut almost 40% of our total asset size.
(The savings can get much higher than that, especially if you have several similar-looking
sprites, such as variations of level tiles.)

For small games like the ones you are likely to build for the js13k competition, setting
up a sprite sheet by hand should be pretty straightforward. How you use the sprites will
depend on your graphics (a CSS-based game can use standard CSS sprite techniques, while
a Canvas-based game will use the long version of `drawImage`, which lets you specify the
`x`, `y`, `width`, and `height` of the source sprite within your sprite sheet).

## 4. Simplify your images

Due to the way PNGs are compressed, images with long blocks or runs of identical color
will produce much smaller file sizes. Try to pick a specific palette and use those colors
wherever you can. Avoid machine-created gradients (which use lots of colors). Where possible,
avoid speckling and noise.

Try doing a google image search for `cel shading` to see some examples of art that uses very
few colors (and large blocks of color). Hopefully, you are a better artist than me, because
I have very little advice to give you here!

## 5. Generate art from code

This is very dependent on what look you're going for and what assets you need. Just be aware
that often, the _code_ to draw a simple crosshair on the screen is probably smaller than
a similar PNG of a crosshair; the code to draw a 64x64 smooth gradient circle will certainly be many
times smaller than a PNG image of the same shape.

In some cases a creative hybrid approach may work. For example, you could use very simple
PNG images as a building block, and then overlay some noise on the image to give the desired
effect. You could have a single PNG template, which you then recolor or skew or overlay to give
additional desired image frames you need in your game.

{% note %}
Be aware that drawing a very complex object (like a player character) using a bunch of basic
primitives might end up much slower than a single `drawImage`. Do your own testing,
but in some cases, it may be better to deal with the space cost of the PNG than the
performance cost of drawing with primitives.
{% endnote %}

## 6. Mangle your properties

By the time your game is complete, your code is full of more or less expressive property
and method names - code like `player.x += player.getNewVelocityX(game.deltaTime)` contains
a bunch of stuff that by default is _not_ mangled (shortened) by terser.

A good way to look for improvements in this area is to open up your minified javascript file,
which will be thousands of characters of this kind of garbage:

```js
W(){let t=this.P(0);if(void 0===t&&(t=this.P(24))
,void 0===t&&(t=this.P(48)),void 0===t){let i=thi
s.z(Math.floor(this.x/32),Math.floor(this.y/32));
i&&(t=g.atanPoints(this,{x:32*i[0]+16,y:32*i[1]+1
6}))}return t}z(t,i,s){let h=[[t,i],[t-1,i],[t+1,
```

Most local variables and function arguments and such are already going to be mangled, which
leaves just property names. If you see a lot of readable English -- like `nextEnemyState` and
`checkEnterExitBounds` and `playWeirdTrainNoise` -- in your minified output, that's a sign
that property mangling could help shrink your zip file size.

The problem with property mangling is that if you mangle _all_ of them, your game will break.
Inevitably, you need to call APIs outside of your control (functions like `drawImage` or
`createOscillator` or `getElementById` are all examples), if you mangle these names, you'll
be attempting to call functions that don't exist.

I recommend, by default, mangling only properties starting with `_`. This is convenient because
it's a somewhat common pattern in Javascript already, to use `_name` to indicate the property
or method is a private property and shouldn't be relied upon to exist. If most of your classes
and objects refer to their internal states (like `this._accelerationX`) with underscored names,
which lets you know they are safe to mangle. You can enable this in your gulpfile like so:

```js
    .pipe(terser({
        mangle: {
            properties: {
                regex: /^_/
            }
        }
    }))
```

You can put pretty much anything in that regex, so if you use certain method names a lot and don't
want underscores everywhere in your code, feel free to add them in to mark them OK to mangle: for example,
`regex: /^_|^render|^update|^drawSprite/`.

{% note %}
**UPDATE 02/24/2019:** I now prefer mangling with the _reserved_ option, see suggestion #8 below.
{% endnote %}

## 7. Lose the shims

While you're in there examining your minified output javascript, take a close look at the top of the file
and see how much (if any) boilerplate there is. Most packing utilities and even transpilers end up
including shims, or `require`/`import` implementations, as boilerplate headers, and in some cases this
can add up to 100s of post-minification bytes.

Whether you want to get rid of that stuff depends on what your current framework is and how invested
you are in one particular build pipeline. For what it's worth, I think the pipeline that produces the
smallest possible build currently is to target basic ES6 javascript, with terser, and concatenate your
javascript files together, with no packing tools.

## 8. Mangled 2: More mangling

When you need to wring maximum space out of your code, one way to do it is to abandon
marking properties as "safe to mangle", and instead mark properties that _aren't_ safe to
mangle. The properties that aren't safe are the ones mentioned last time: APIs you use on `window` or `document`,
on your Canvas context or AudioContext, etc.

Note that terser will already avoid mangling functions on many of the core objects, like Array,
Math, Date, Function, etc. So you don't need to go crazy and list every `substring` or `slice` or `forEach` you use,
those will automatically be left alone.

If you are going this route, you should probably just turn on toplevel mangling as well, to mangle your root-level
class names and object names (if any).

Example of what this might look like in your gulpfile:

```js
    .pipe(terser({
        mangle: {
            toplevel: true,
            properties: {
                reserved: [
                   'getElementById',
                   'getContext',
                   'drawImage',
                   'fill',
                   'moveTo',
                   'lineTo',
                   'linearRampToValueAtTime',
                   'createOscillator',
                   // ... lots more lines ...
                ]
            }
        }
    }))
```

If you plan on going this route, it might help to start early - this way you can add to the list of
reserved property names as you write new code. If your project is already finished, prepare for a long
night of debugging while you get it set up! The result, though, will be a minifed product that can't
get much smaller.

{% note %}
Note that terser does not care what object a property or method lives on; it cannot distinguish between,
for example, `game.update()`, `player.update()` and `enemy.update()`. However, once it assigns a property
a new mangled value, it will use it throughout your entire codebase, so it also doesn't _need_ to care -
all references to `update` on all objects will be mangled to a new, shorter name.
{% endnote %}

{% note %}
Because terser won't mangle properties available on the common APIs of things like String, Math, and others,
make sure not to reuse names like `slice`, `length`, etc. for your own properties. Your code will work
fine, but those properties won't get mangled! Pick different names, or use the underscore trick from
above (`_length`).
{% endnote %}

{% note %}
**UPDATE 02/24/2019:** Terser is now quite good at reserving all known browser API methods by default,
making this suggestion much easier. I now like this approach the most (just make sure you use the latest
available version of terser).
{% endnote %}

## 9. Advanced compression

The `AdvanceCOMP` project, available from [AdvanceMAME](https://www.advancemame.it/download), gives two
useful utilities for further compressing your images and ZIP files. If you're on Mac or
Linux, you'll need to build from source, which can sometimes be a project all of its own (although
my experience was that this was pretty easy on MacOS). This tool is also listed on the js13k resources page.

The `advpng` tool allows you to recompress PNGs. My experience is that for most images, it cannot
get smaller (and even when it can, it's only a handful of bytes), but it never hurts to try.

The `advzip` tool is a little more impressive, I found it could shave another 3-5% off of the final zip
file size - late in the competition, that's 300-400 bytes of additional code, which can be quite a
bit of final polish.

```bash
# To recompress your PNGs
advpng -4 -z out/*.png

# To recompress your final zip file
advzip -4 -z game.zip
```

Both tools also offer an option to spend even more cycles finding the smallest possible encoding;
again, this is going to squeeze out only a small handful of bytes, and it boosts the time it
takes from 2-3 seconds to 60+ seconds, but if you really want the smallest possible output, use
the `iterations` setting:

```bash
advpng -4 -i 5000 -z out/*.png
advzip -4 -i 5000 -z game.zip
```

One way to integrate `advpng` and/or `advzip` into your build pipeline is by using the `gulp-shell` package.

## 10. Use the same core functions for similar tasks

I consider this a "last resort", but I did say we were making the _smallest possible_ ZIP file here...

Keeping in mind the way ZIP file compression works, one way to eliminate extra bytes
is to ensure you are calling the fewest possible core functions. For example: if you use
both `.match()` and `.indexOf()`, `.match()` is typically able to do the job of either. If
you use both `.push(value)` and `.concat(array)`, `.concat([value])` can be used instead of
`.push()`. If you use both `for()` and `forEach()`, and _don't have any loops that you break
out of_, you might be able to replace all `for`s with `forEach`s. Ditto for `splice()` and `slice()`.

At this point, in my opinion, you're beginning to damage your _source code_'s legibility, so
how far you want to take it is up to you. My recommendation would be to stop short of this
step and consider cutting a feature, shortening a music loop, simplifying a sprite, dropping a
level, doing anything other than butchering your own poor, defenseless source code...

## That's it!

Have you discovered a trick for shaving a few bytes off your ZIP file? Feel free to post a comment below.
