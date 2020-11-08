---
title: Scaling a pixel art game for the browser
tags: [javascript, js13k]
date: 2020-11-08
---

There are many types of graphics you can use in a browser game. If you are using vector graphics or canvas primitives, then browser dimensions don't always matter. However, if you're trying to create a classic pixel art look in your game, how you scale your game for the browser can make a big difference in the outcome.

As an example, let's say you have chosen to design a game with target dimensions of `480x270px` (a 16:9 ratio). I've created an example image of this size to use as a prop:

![Example Game Grid](grid.png)

(Note: this image is actually a little larger than `480x270px` - I've included a `4px` red border. This will make it easier to highlight when what you are seeing on the canvas is "outside" of your original intended dimensions, which you'll notice in some of the later examples on this page.)

## Setup

Before we explore different scaling approaches, let's setup a simple game. First, we'll create an `index.html`. All we need for this project is a single `<canvas>` element.

``` html index.html
<canvas id="canvas"></canvas>
```

Next, let's make sure that our canvas takes up the full size of the browser, with no margin or padding.

``` css game.css
document, body {
    margin: 0px;
    padding: 0px;
}
#canvas {
    width: 100%;
    height: 100%;
}
```

Now we need to initialize our canvas, load our sample image, and get ready to display the first frame of our "game".

``` js game.js
const GAME_WIDTH = 480;
const GAME_HEIGHT = 270;

const Game = {
    init() {
        // Initialize canvas
        Game.canvas = document.getElementById('canvas');
        Game.ctx = Game.canvas.getContext('2d');

        // Load our "game grid" image
        Game.image = new Image();
        Game.image.src = 'grid.png';

        // Request first frame
        Game.image.onload = () => {
            window.requestAnimationFrame(() => Game.update());
        };
    }
};

Game.init();
```

For our game, we'll plan on calling `Game.update` once per frame - so let's go ahead and add it to our `Game` object.

``` js game.js
    update() {
        Game.resize();
        Game.ctx.drawImage(Game.image, -4, -4);

        window.requestAnimationFrame(() => Game.update());
    }
```

You'll see that first we call another method, `Game.resize`, which we haven't defined yet. Then we draw our grid image (note the negative offset -- remember, that's because our `480x270` grid has a 4 pixel red border around it, which isn't actually part of our game). Last, we tell the browser to call `Game.update` again on the next frame.

That's it! Now that our game loop is ready to go, let's talk about the different ways to define that `Game.resize` method.

## Approach 1: Set game size

This approach is easy to set up and easy to understand. Let's implement `Game.resize`:

``` js game.js
    resize() {
        // Set the canvas width and height
        Game.canvas.width = GAME_WIDTH;
        Game.canvas.height = GAME_HEIGHT;

        // Don't forget to turn off image smoothing
        Game.ctx.imageSmoothingEnabled = false;
    }
```

{% play_link "See Approach 1 in action" "example1.html" %}

Try dragging your browser window around (make it tall and skinny, wide and long, etc.). Note how the debugging info shows that although the browser size keeps changing, the game size stays fixed. This results in different perceived horizontal and vertical scaling (making for "stretched" or "squashed" sprites). The advantage is that your game logic can be very simple, as you always know your virtual real estate is `480x270px`, so whether this potential squashing is an issue depends on your game.

Before we continue, though, let's make an additional improvement. Even though this example should be pixel-perfect, on many screens (especially Retina displays), it may be blurry due to your _device pixel ratio_. Fortunately, we can correct for this.

## Approach 2: Set game size, respecting device pixel ratio

Let's improve our `Game.resize` method.

``` js game.js
    resize() {
        let dpr = window.devicePixelRatio;

        // Set the canvas width and height, taking pixel ratio into account
        Game.canvas.width = GAME_WIDTH * dpr;
        Game.canvas.height = GAME_HEIGHT * dpr;

        // Scale the canvas based on pixel ratio
        Game.ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

        // Don't forget to turn off image smoothing
        Game.ctx.imageSmoothingEnabled = false;
    }
```

{% play_link "See Approach 2 in action" "example2.html" %}

What we do here is set the canvas's width and height to a _multiple_ of our game's width and height, and then we compensate for that by scaling the canvas. For example, if your display's _device pixel ratio_ is `2`, we would set our canvas to `960x540` (instead of `480x270`) and then we would "zoom in" (scale) by `2`. The result is nearly identical, except that on these displays the blurry image will now be nice and crisp. Check out the link above and compare to the first example to see the difference.

## Approach 3: Set game scaling (black bars)

Now let's consider an alternate approach. Instead of accepting the potentially different horizontal and vertical scaling, we could instead force them to be consistent. Let's update our `Game.resize` method again.

``` js game.js
    resize() {
        let dpr = window.devicePixelRatio;

        // Get browser's x/y scaling
        let xScale = Game.canvas.clientWidth * dpr / GAME_WIDTH;
        let yScale = Game.canvas.clientHeight * dpr / GAME_HEIGHT;

        // Round down to 2 decimal places (e.g. 2.73)
        xScale = Math.floor(xScale * 100) / 100;
        yScale = Math.floor(yScale * 100) / 100;

        // Select the lowest scale
        let desiredScale = Math.min(xScale, yScale);

        // Set the canvas width and height, taking pixel ratio into account
        Game.canvas.width = Game.canvas.clientWidth * dpr;
        Game.canvas.height = Game.canvas.clientHeight * dpr;

        // Scale the canvas using our chosen scale
        Game.ctx.setTransform(desiredScale, 0, 0, desiredScale, 0, 0);

        // Don't forget to turn off image smoothing
        Game.ctx.imageSmoothingEnabled = false;
    }
```

The trick with this approach is that we set our canvas width and height to the size of the _browser_, not our game (while taking device pixel ratio into account). We then "zoom" (scale) by our desired scale, chosen by picking the highest scaling of either the horizontal or vertical scale.

{% play_link "See Approach 3 in action" "example3.html" %}

Play with the browser size again. Note how the scale is always fixed, which means the _perceived size_ of the game changes at extreme browser sizes. Instead of stretching or squashing, we instead have classic "black bars" (either left/right or top/bottom).

Now, this might be exactly what you want, but you don't have to leave it that way. You could continue to render exactly `480x270` in the middle of the canvas and accept the black bars, or, you could fill the whole canvas with additional content (for example, if you are building a dungeon crawler, just render more of the map to take up the full canvas). Keep in mind that users with very narrow or very wide browsers will see quite a bit "more map" than a user with traditional dimensions, which could be an advantage in some games.

If your game supports mobile, taking the black bars approach would make your `480x270` game act like a YouTube video - large black bars on top and bottom when viewed in portrait mode, and then if flipped to landscape would fill the screen (that's a nice free feature if this is the behavior you want).

## Approach 4: Set game scaling (zoom)

Similar to playing an old movie on your newer TV, we have multiple options for dealing with the scale difference between the browser and our game. Instead of the "black bars" approach, we can also try the "zoom" approach.

``` js game.js
    resize() {
        let dpr = window.devicePixelRatio;

        // Get browser's x/y scaling
        let xScale = Game.canvas.clientWidth * dpr / GAME_WIDTH;
        let yScale = Game.canvas.clientHeight * dpr / GAME_HEIGHT;

        // Round down to 2 decimal places (e.g. 2.73)
        xScale = Math.floor(xScale * 100) / 100;
        yScale = Math.floor(yScale * 100) / 100;

        // Select the lowest scale
        let desiredScale = Math.max(xScale, yScale);

        // Set the canvas width and height, taking pixel ratio into account
        Game.canvas.width = Game.canvas.clientWidth * dpr;
        Game.canvas.height = Game.canvas.clientHeight * dpr;

        // Scale the canvas using our chosen scale
        Game.ctx.setTransform(desiredScale, 0, 0, desiredScale, 0, 0);

        // Don't forget to turn off image smoothing
        Game.ctx.imageSmoothingEnabled = false;
    }
```

{% play_link "See Approach 4 in action" "example4.html" %}

The only difference between this approach and the last one is that we replaced `Math.min` with `Math.max` - we are selecting the lowest scale instead of the highest. Instead of adding black bars where extra content would go, this "zooms in", losing either top/bottom content or left/right content, depending on the browser.

Notice how the game always fills the screen, but there is now part of the game grid you cannot see anymore when you drag your browser to be narrow or wide. This approach means you don't have to figure out what to put in the "extra" game area - but, you need to make sure your game is still playable (perhaps by making your UI float based on the new game dimensions).
