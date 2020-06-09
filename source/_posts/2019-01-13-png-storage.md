---
title: PNG Storage
tags: [javascript, js13k, png]
excerpt: >-
  Using PNG files to compress game data: can you save space by storing levels and
  other assets as images?
redirect_from:
  - /png-storage/
---

## Using PNG files to compress game data

I had a conversation with a friend during the holidays that piqued my interest: I
was describing some of the hoops I had jumped through to get my level data for my
js13k entry to fit into 13kb, and he suggested I might have been able to shortcut
some of those hoops by saving the levels as PNG files instead.

This made sense, as my custom algorithm was just doing a simple version of
[run-length encoding](https://en.wikipedia.org/wiki/Run-length_encoding). I'd just
be doing the same thing, but adding in the power of imagemin/advpng.

On a whim I did some number crunching to see how feasible this would be for js13k. For
the rest of this post, every PNG and ZIP file size you see has already been recompressed
using `advpng -z -4` and/or `advzip -z -4`, respectively.

## alpha.json

My first file is a relatively small JSON file full of numbers. This could be a simple
level format, or perhaps a series of monster coordinates, AI paths, maybe font data,
etc.

```
  698  alpha.json
  276  alpha.zip
  265  alpha-t-1c.png
  387  alpha-t-1c.zip
  212  alpha-b-1c.png
  334  alpha-b-1c.zip
  171  alpha-b-4c.png
  293  alpha-b-4c.zip
```

At the top is my raw JSON file, with the output as raw ZIP. Treating the file as raw
text (1 ascii byte per pixel) just barely beat the zipped file, but remember that any
PNG file will end up in your end ZIP, so you really want to compare it as a ZIP file.

Parsing the JSON file into actual numbers (1 ascii byte per pixel) was a little better,
but not by much.

The best results were parsing the JSON file, and then using all 4 channels (RGBA), one
for each byte; this of course requires input in the range 0-255 for each byte. This PNG
is significantly smaller then the zipped version; after zipping it is at least comparable.

## beta.json

For the second test I used a very large JSON file, one of my levels from js13k this year,
although it contains a _lot_ of duplication (many rows of zeroes).

```
67911  beta.json
 1002  beta.zip
 1813  beta-t-1c.png
  940  beta-t-4c.png
 1042  beta-t-4c.zip
```

The JSON structure in this case is pretty complex and it would require a lot of work to
turn into a single byte stream, so I had to just treat it as text. Again, text-to-RGBA
gives the best results, although it's not _significantly_ better than just zipping the file.

## readme.md

My last example is just a readme file; in a text-heavy adventure game, this might be a
series of strings and room descriptions, etc.

```
10693  README.md
 4836  readme.zip
 4790  readme-t-4c.png
 4912  readme-t-4c.zip
```

As expected, it's hard to beat a zip file's dictionary encoding with PNG.

## Example code

Interested in trying it out yourself? I used [pngjs](https://github.com/lukeapage/pngjs) to run
my tests. (You could of course generate these out of a canvas in a browser, but in practice you
want something that can run as part of your gulp pipeline.)

```javascript
var fs = require('fs');
var PNG = require("pngjs").PNG;

// Blob is an array of bytes 0-255. Where you get it is up to you - read binary
// data from a file, stringify a JSON object and get as a buffer, a custom loader
// and unloader, etc.
var blob = [ /* data */ ];

var w = Math.ceil(blob.length / 4);
var h = 1;
var png = new PNG({ width: w, height: h });

// If blob isn't divisible by 4, zero-pad remaining bytes. It's the responsibility
// of your unloader to know when the real data ends.
for (let i = 0; i < w * 4; i++) {
    png.data[i] = blob[i] || 0;
}

png.pack().pipe(fs.createWriteStream('out.png'));
```

If you do end up using this technique, then of course you also need to add the code
in your game to actually get the level data _out_ of the image in the browser. You
can use the standard off-screen canvas technique to do that:

```javascript
let img = document.getElementById('image');
let canvas = document.createElement('canvas');
canvas.width = img.width;
canvas.height = img.height;
canvas.getContext('2d').drawImage(img, 0, 0, img.width, img.height);
let blob = canvas.getContext('2d').getImageData(0, 0, img.width, img.height).data;

// You now have "blob", the same stream of bytes you wrote originally.
```

## Conclusions?

It's very close. I think for any particular game, it's going to come down to the specifics
of the data you are loading, how dense it is, how much repetition, etc. There's no guarantee
that storing a level as bytes in a PNG and loading it in your game will end up _smaller_ than
simply storing your level as JSON text in-line in your game's javascript, you'll need to
try it out yourself. Make sure your comparison is the "final size" (fully minified and zipped),
as that's the only real measurement here!

I'm not yet convinced it's worth it, but I'll definitely keep this in mind for this year's comp.
