---
title: Add WebGL shaders to your gulp build
tags: [javascript, js13k, gulp, webgl]
date: 2019-03-02
alias:
- /2019-03-02/add-shaders-to-your-gulp-build/
- /add-webgl-shaders-to-your-gulp-build/
---

So, you've been following some tutorials online on WebGL, you're playing around with
shaders, and it's time to incorporate them into your gulp build. (If you aren't,
and are interested, I highly recommend the [WebGL Fundamentals](https://webglfundamentals.org/).)

A common technique (one the author of WebGL Fundamentals mentions) is inserting
your shaders into your HTML source in non-javascript `<script>` tags, and loading them
at runtime.

``` html index.html
<script id="my-vertex-shader" type="text">
    attribute vec4 a_position;

    void main() {
        gl_Position = a_position;
    }
</script>
```

``` js game.js
// Load the shader source
var vertexShaderSource = document.getElementById('my-vertex-shader').text;
// Create shader, compile program, etc...
```

This works, but as your shader complexity (and total number of shaders) goes up,
it can be frustrating to be staring at that HTML - we'd like to split that stuff
into separate files, and wouldn't it be nice to have dedicated syntax highlighting?
(If you're a VSCode user, check out the [Shader languages](https://github.com/stef-levesque/vscode-shader)
extension!).

With gulp, we can do better. We're going to use the same technique I covered
in {% post_link 'optimizing-for-space-2' %}, but this time, for our shaders.

## Inserting shaders at build time

The first thing to do is take all of your shaders out of the HTML file, and place
them in separate files. What I recommend is naming your vertex shaders `*.vert`,
and your fragment shaders `*.frag`, and then also placing them in separate subfolders.
Here's an example:

```text
    /src
    ├── index.html
    ├── /js
    │   └── *.js
    ├── /frag
    │   ├── fancy.frag
    │   └── shiny.frag
    └── /vert
        ├── fancy.vert
        └── shiny.vert
```

(We'll see why the subfolders are useful in a few seconds.)

Add the `gulp-glsl` plugin to your build, and let's add a task that will slurp up all these
shader files. The plugin supports several output formats, but we're going to use the `json`
format.

```js
const glsl = require('gulp-glsl');

function compileShaders() {
    return gulp.src('src/**/*.+(vert|frag)')
        .pipe(glsl({ format: 'json', filename: 'ShaderData.json' }))
        .pipe(gulp.dest('temp'));
}
```

What this gulp task does is take all these individual shader files and produce a single file,
`temp/ShaderData.json`, that looks like this:

```js
// Example of a generated ShaderData.json
{
    "frag": {
        "fancy": "... shader source ... ",
        "shiny": "... shader source ... ",
    },
    "vert": {
        "fancy": "... shader source ... ",
        "shiny": "attribute vec4 a_position;void main(){gl_Position=a_position;}"
    }
}
```

The `gulp-glsl` plugin will already do some very basic minimizing for us (mostly eliminating whitespace). As
you can see, this is where those folders come in: by default, the plugin will use the folder structure of
the input files to build a "tree" in the JSON output. If you were to load this JSON blob, and you wanted the
`fancy` shaders, you could get the shaders by grabbing `.frag.fancy` and `.vert.fancy`.

In fact, let's turn this JSON file into an actual JavaScript source file and include it into our main `js` task.

```js
const add = require('gulp-add');

function loadShaders() {
    // Parsing the JSON and "util.inspecting" it produces source code that
    // looks more human than just inserting the raw JSON. This is optional
    // if you're going to terse it anyway (it'll likely do it for you).
    let jsonString = util.inspect(JSON.parse(fs.readFileSync('temp/ShaderData.json', 'utf8')));
    return 'const ShaderData = ' + jsonString + ';';
}

function js() {
    return gulp.src('src/*.js')
        .pipe(add('ShaderData.js', loadShaders(), true))
        .pipe(concat('app.js'))
        .pipe(terser())
        .pipe(gulp.dest('dist'));
}

module.exports = {
    // See my previous blog post for examples of "html" and "final"
    build: gulp.series(compileShaders, js, html, final)
};
```

Our strategy here is a little different than last time - before, we were processing CSS and JavaScript, and
inserting it into the HTML. Now we're processing shader files, turning them into an imaginary source
file called `ShaderData.js`, which is then packed into the rest of our source. At run time, we can now
load our shaders, like so:

```js
// Here is the "generated" block of JSON data, inserted during the build
const ShaderData = {frag:{"my-vertex-shader":"..."},vert:{"my-vertex-shader":"..."}};

// Instead of doing this (loading from HTML):
var vertexShaderSource = document.getElementById('my-vertex-shader').text;

// Now, we do this:
var vertexShaderSource = ShaderData.vert['my-vertex-shader'];

// Then we go on to compile our program, etc.
```

Make sense? At this point, we're finished... unless we're building a #js13k game. Hold on to your hats!

## Mangling shader variables

If we want to shave off every byte possible, we're going to want to mangle those shader variable
names. Nobody wants variables like `u_worldTransformReverseMatrix` running around. This is not
like normal mangling, though - shader programs are just strings, not something `terser` can handle
for us. We can use a dedicated GLSL minimizer, like [glsl-minifier](https://github.com/TimvanScherpenzeel/glsl-minifier),
but that tends to focus on internal variables, not the attribute and uniform inputs our game uses.

What we really want is a custom mangling step. We want to identify all references in our program
to the "magic vars" (variables starting with `u_`, `v_`, and `a_`), and mangle them. We need to do this
globally, so we can catch references inside the shader programs and in strings in our JavaScript, such
as calls to `getUniformLocation`, etc., in the WebGL API. We also want to do this _before_ we run terser,
which might accidentally pre-mangle one of our magic vars so we can't recognize it.

{% note %}
I'm using the convention that the WebGL Fundamentals uses for my shader vars, which is what enables
this particular approach. If you don't like using `u_/a_/v_`, you can use a different naming strategy,
but it has to be one that makes the variables easily distinguishable from all other text in your
application.
{% endnote %}

So, we want to insert a new custom step right here:

```js
// Back to the gulpfile...

const mangleShaderVars = require('./mangleShaderVars');

function js() {
    return gulp.src('src/*.js')
        .pipe(add('ShaderData.js', loadShaders(), true))
        .pipe(concat('app.js'))
        .pipe(mangleShaderVars())  // <-- Perfect! Just one file, and not yet tersed
        .pipe(terser())
        .pipe(gulp.dest('dist'));
}
```

You can see I've already required the imaginary file `mangleShaderVars.js`, so let's go ahead and create it.
Now, to keep our gulpfile nice and clean, I'm treating this new module like a gulp plugin. Creating your
own gulp plugin is interesting, but outside the scope of this article, and all we really want to do is
replace the content of a single file (and we don't need to worry about source maps, because we're going to
edit existing lines without adding or removing any). So we're going to wrap a standard function
with the `gulp-modify-file` plugin, to keep things simple.

Here's our `mangleShaderVars.js`.

```js
const modifyFile = require('gulp-modify-file');

function mangleShaderVars(source) {
    // Do something here.
    return source;
}

module.exports = function () {
    return modifyFile((content, path, file) => mangleShaderVars(content));
};
```

Now that the gulp plumbing is taken care of, we can focus on our code. There are many ways you can tackle this,
but let's go with a basic regex approach. We'll repeatedly scan the source code for matching variables,
replacing them as we find them. Each time we replace a variable, we'll add it to a table of previous matches
(so we can use the same replacement if we see it again).

Here's the whole function, with comments:

```js
function mangleShaderVars(source) {
    // Match any alphanumeric string starting with u_, a_, or v_.
    // The match starts with any NON-alphanumeric character.
    let regex = /([^a-zA-Z0-9])([uav]_[a-zA-Z0-9]+)/g;

    // Match placeholder
    let match;

    // Our table of replacement names
    let table = {};

    while (match = regex.exec(source)) {
        // Mangle the name... we'll need to define this!
        let name = mangle(match[2], table);

        // Modify the source code
        source = source.substring(0, match.index) + match[1] + name + source.substring(match.index + match[0].length);

        // Fudge the regular expression's last index
        regex.lastIndex -= match[2].length - name.length;
    }

    // Optional sanity check, print out the table of replacement names
    console.log(table);

    // Return updated source code to gulp
    return source;
}
```

It's important that we _not_ match partials (a variable like `alpha_var` would be seen as `a_var`), so we
actually capture two groups - the first group will be some non-alphanumeric character (most likely syntax,
like a quote, an operator, a space, etc.), and the second group is the matched variable name. We use
substrings to insert the new mangled name into the source code, taking care to keep that errant character
we captured at the beginning. And last, we fudge the `lastIndex` of our running regular expression.

{% note %}
If you aren't that familiar with regular expressions, note that we're using the `regex.exec(string)`
approach and not the common `string.match(regex)` approach. The advantage is that `exec` automatically
keeps track of the last index matched, and continues marching down the string looking for new matches -
it's ideal for string scanning. In our case, because we are _modifying_ the string, we need to be careful
to subtract the difference between the length of our old name and our new name -- for example, if the old name was
`v_normal`, and our new name is `v_a`, we need to subtract 5 from the `lastIndex` of our regular expression.
Otherwise it will "jump ahead" 5 characters into the modified string, and possibly skip one of the
variables we want to replace.
{% endnote %}

Alright, we're close. Now we just need to define what our "mangled names" look like. Here's a simple approach:

```js
function mangle(name, table) {
    if (!table[name]) {
        let index = Object.keys(table).length;
        let newName = name.substring(0, 2) + String.fromCharCode(97 + index);
        table[name] = newName;
    }
    return table[name];
}
```

Here, we're intentionally keeping the prefix (`u_`, `a_`, or `v_`), and then selecting a single alphabetical
letter (`a`, `b`, `c`, and so on). This'll work fine as long as your program has no more than 26 variables;
if your shader is large, you'd want to support 2-character names (`aa`, `ab`, etc.). A good example of a
very robust mangler is [terser's implementation](https://github.com/terser-js/terser/blob/v3.16.1/lib/scope.js#L750),
but for now, I'll stick with our simple mangle function.

I'll go ahead and build this, on a small sample 3D project:

```text
[10:24:12] Starting 'compileShaders'...
[10:24:12] Finished 'html' after 56 ms
[10:24:13] Finished 'compileShaders' after 71 ms
[10:24:13] Starting 'js'...
{ u_color: 'u_a',
  v_normal: 'v_b',
  u_reverseLightDirection: 'u_c',
  a_position: 'a_d',
  u_matrix: 'u_e',
  a_normal: 'a_f',
  u_worldViewProjection: 'u_g',
  u_wit: 'u_h',
  a_color: 'a_i',
  u_worldInverseTranpose: 'u_j' }
[10:24:13] Finished 'js' after 349 ms
```

And, sure enough, in the output `app.js`, all string references to `u_worldViewProjection` have been replaced with `u_g`.

## Respecting mangled variables in terser

Right now, we have a working shader program mangler. However, we do have a problem looming on the horizon -
this only works as long as _all_ of our references to shader variables are inside strings. As soon as
we start doing anything fancy (for example, defining helper methods or getter/setter methods to represent
our uniforms), we are going to have issues with terser.

This is actually an issue anytime you mix strings and property names and use an aggressive property mangler.
For example, leaving shaders behind for a second, imagine this snippet of a keyboard input handler:

```js
// Map keyboard codes to our inputs
mapping[87] = 'up';     // W
mapping[83] = 'down';   // A
mapping[65] = 'left';   // S
mapping[68] = 'right';  // D

// Look at an incoming key event
if (mapping[e.keyCode]) inputs[mapping[e.keyCode]] = true;

// Later, check if user is pressing the UP input
if (inputs.up) {
    // Oh no! THIS will never work, because ".up" will be mangled, but the code above it
    // will not. Mixing strings and property names like this is bad.
}
```

OK, so mixing strings and property names would get messy... But, why would that happen? Is there any
reason we'd be using the name of a shader variable as a property or method name? Usually, it's
when you start wrapping up annoying pieces of WebGL into a nice program handler. Imagine some
wrapper code like the following:

```js
let Program = {
    vars: {
        u_worldViewProjection: 'uniformMatrix4fv',
        u_worldInverseTranspose: 'uniformMatrix4fv',
        u_reverseLightDirection: 'uniform3fv'
    },
    lastValues: {},
    locations: {},
    init(program) {
        Object.keys(this.vars).forEach(key => {
            this.locations[key] = gl.getUniformLocation(program, key);
            Object.defineProperty(this, key, {
                get() {
                    return this.lastValues[key];
                },
                set(value) {
                    this.lastValues[key] = value;
                    gl[vars[key]](this.locations[key], value);
                }
            });
        });
    }
};

Program.init(myShaderProgram);

// Now, instead of dealing with this kind of mess:
gl.uniformMatrix4fv(u_worldViewProjectionLocation, myMatrix);

// We can use "normal-looking" setters:
Program.u_worldViewProjectionLocation = myMatrix;
```

In this example we only looked at uniforms, but you can imagine similar code that wraps up the process of
obtaining locations, setting values, etc., for our buffers as well. However, the code above won't work
if our custom shader mangler turns `u_worldViewProjectionLocation` throughout the source file into `u_a`,
but then terser turns the _property_ `u_a` into `ab`. So, we need to be able to tell terser not to mess
with our pre-mangled values.

Terser supports this functionality out of the box (with the `reserved` keyword). All we need to do when
we turn on property mangling is pass it in. Chances are we're _already_ reserving some property names
for other reasons, so this might look something like this:

```js
// Back to the gulpfile!

function js() {
    // Our list of reserved properties
    let reserved = [
        'example',
        'various properties not to mangle'
    ];

    return gulp.src('src/*.js')
        .pipe(add('ShaderData.js', loadShaders(), true))
        .pipe(concat('app.js'))
        .pipe(mangleShaderVars(reserved))
        .pipe(terser({
            mangle: {
                properties: {
                    reserved: reserved
                }
            }
        }))
        .pipe(gulp.dest('dist'));
}
```

Here, we've added an array of property names to reserve, and are passing a reference to that array to
both our custom mangler and to terser's options.

We will take our initial implementation of `mangleShaderVars` from before (sans most of the comments), with
a couple new tweaks.

```js
function mangleShaderVars(source, reserved) {
    let regex = /([^a-zA-Z0-9])([uav]_[a-zA-Z0-9]+)/g;
    let match;
    let table = {};

    while (match = regex.exec(source)) {
        let name = mangle(match[2], table);
        source = source.substring(0, match.index) + match[1] + name + source.substring(match.index + match[0].length);
        regex.lastIndex -= match[2].length - name.length;
    }

    console.log(table);

    Object.values(table).forEach(value => reserved.push(value));

    return source;
}

module.exports = function (reserved) {
    return modifyFile((content, path, file) => mangleShaderVars(content, reserved));
};
```

We've wired up a new parameter (the array of reserved words), and we append all of our mangled variable names
to the array once we're done with our own logic. Now, anywhere in our code that we use one of
our output names as a property, it will be left alone by terser.

{% note %}
We're cheating a little here, and taking advantage of the fact that `terser` accepts its options object
at initialization time, but does not _parse_ those options until it begins minifying. That's why we can
get away with appending a bunch of new values to the array we passed to `terser`, in the step right before
tersing.
{% endnote %}

## Testing our theory

Something really important when doing space optimizations (especially for js13k) is testing whether
it _even works_. It's really easy to make obvious "improvements" to your source code,
only to discover that the original was actually better once you take tersing and optimized zipping
into account.

For a test case, I'll use a simple little 3D demo I've been working on (following along with the
WebGL Tutorials link at the top of this blog post). For this particular demo, here's the debugging
output from our `mangleShaderVars` method:

```js
{
  u_color: 'u_a',                     //  4
  v_normal: 'v_b',                    //  5
  u_reverseLightDirection: 'u_c',     // 20
  a_position: 'a_d',                  //  7
  u_matrix: 'u_e',                    //  5
  a_normal: 'a_f',                    //  5
  u_worldViewProjection: 'u_g',       // 18
  u_wit: 'u_h',                       //  2
  a_color: 'a_i',                     //  4
  u_worldInverseTranpose: 'u_j'       // 19
}

// Total Expected Savings              ~ 89 bytes
```

I've added comments showing the expected space savings for each variable. We would expect a fully optimized
zip file to store every variable only once in its string dictionary (potentially even less, for variables
that share a common prefix). Based on the numbers above, in theory, our _maximum potential savings_ for
adding our custom mangling should be an ~89 byte difference.

Let's test, using `advzip -z -4 -i 1000` for optimization:

```text
# Before (not mangled)

Finished app.js:              10331
Optimized zip file:            3759

# After (mangled)

Finished app.js:              10097 (- 234 bytes)
Optimized zip file:            3717 (-  42 bytes)
```

According to these numbers, I got roughly half of the ideal savings, which isn't bad!

{% note %}
Why wouldn't we get the full expected savings? It all has to do with the ZIP dictionary, which we are
optimizing to be as smart as possible. As a simple example, notice that `u_worldViewProjection` and
`u_worldInverseTranspose` both start with `u_world`; almost certainly the dictionary already optimized
that prefix out, reducing our expected savings by 5 characters. Another issue is existing variables
that can't be optimized out, such as the built-in `gl_Position`: because it shares 7 characters with
`a_position`, that dictionary entry won't go away at all, meaning those 7 characters of savings are
lost. That's why it's important to actually test our optimizations!
{% endnote %}

## Conclusions

In this article we built some custom WebGL shader infrastructure, including program variable mangling,
and proved it works and can reduce overall game size. Whether you use any of this for your own GL-based
js13k game depends on how badly you need those extra bytes, but I hope the journey was interesting!
