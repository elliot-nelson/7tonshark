---
title: Creating simple music using the Web Audio API
tags: [javascript, js13k]
date: 2018-09-13
alias:
- /2018-09-13/web-audio-part-1/
---

So, you've never used the Web Audio API before, and you want to add some music to your small javascript project / game / js13k entry? Let's jump straight into it and make a noise.

```js
// Create an audio context
var ctx = new AudioContext();

// Create a single "oscillator" - this is a sound!
var o = ctx.createOscillator();

// Connect it to the destination (the speakers)
o.connect(ctx.destination);

// Choose a frequency. We'll come back to this.
o.frequency.value = 270;

// Set a start time for our sound (now!)
o.start(ctx.currentTime);

// Set a stop time (we'll let it play for half a second)
o.stop(ctx.currentTime + 0.5);
```

{% play_button "Play Sound" "example1.run()" %}

Pretty simple! Note that when you set up an oscillator, you specify when in the future to start (in the case
above, we're asking the audio context to start _right now_). That means you can schedule lots of future notes
at once. Let's extend the example above to play a few more frequencies.

```js
// Create 3 notes. Each note has a different frequency value, and each note
// stops and starts at a different time.

var o1 = ctx.createOscillator();
o1.connect(ctx.destination);
o1.frequency.value = 270;
o1.start(ctx.currentTime);
o1.stop(ctx.currentTime + 0.5);

var o2 = ctx.createOscillator();
o2.connect(ctx.destination);
o2.frequency.value = 300;
o2.start(ctx.currentTime + 0.5);
o2.stop(ctx.currentTime + 1);

var o3 = ctx.createOscillator();
o3.connect(ctx.destination);
o3.frequency.value = 330;
o3.start(ctx.currentTime + 1);
o3.stop(ctx.currentTime + 1.5);
```

{% play_button "Play Sound" "example2.run()" %}

These examples are going to get really long if we keep repeating ourselves like this, so let's make a function
to encapsulate playing a note.

```js
function play(node, frequency, start, length) {
    // Note how we pass in what "audio node" to connect our oscillator to,
    // that'll be useful shortly!
    var o = node.context.createOscillator();
    o.connect(node);
    o.frequency.value = frequency;
    o.start(start);
    o.stop(start + length);
}

play(ctx.destination, 274.17, ctx.currentTime + 0.0, 0.2);
play(ctx.destination, 308.06, ctx.currentTime + 0.2, 0.2);
play(ctx.destination, 346.13, ctx.currentTime + 0.4, 0.2);
play(ctx.destination, 366.90, ctx.currentTime + 0.6, 0.2);
```

{% play_button "Play Sound" "example3.run()" %}

Hey, that actually sounds like music!

## Eliminating audio "clicks"

Before we continue, let's talk about that clicking. Depending on your current browser, the example above
may have distracting clicks at the either the front or back of each note (or both). Our oscillator, which
generates a sound at a frequency, is abruptly switching on and switching off. In real life, sound doesn't
work that way - each sound you hear has a certain "envelope", which means it fades in from zero, lasts
for a certain duration, and then fades back out to zero at the end.

We can create an envelope for our notes by managing _gain_ (volume). To do that, we need to create
an audio gain node, and connect our oscillator notes to the gain node. Then we will add some additional
logic to our play function, which will micro-manage the volume over time:

```js
// Create a "gain node", which we'll use to play our notes
var gainNode = ctx.createGain();
gainNode.connect(ctx.destination);

function play(node, frequency, start, length) {
    var o = node.context.createOscillator();
    o.connect(node);
    o.frequency.value = frequency;

    // At note=0%, volume should be 0%
    node.gain.setValueAtTime(0, start);

    // Over the first 10% of the note, ramp up to 100% volume
    node.gain.linearRampToValueAtTime(1, start + length * 0.1);

    // Keep it at 100% volume up until 90% of the note's length
    node.gain.setValueAtTime(1, start + length * 0.9);

    // By 99% of the note's length, ramp down to 0% volume
    node.gain.linearRampToValueAtTime(0, start + length * 0.99);

    o.start(start);
    o.stop(start + length);
}

// Instead of playing on ctx.destination directly, play on our gain node
play(gainNode, 274.17, ctx.currentTime + 0.0, 0.2);
play(gainNode, 308.06, ctx.currentTime + 0.2, 0.2);
play(gainNode, 346.13, ctx.currentTime + 0.4, 0.2);
play(gainNode, 366.90, ctx.currentTime + 0.6, 0.2);
```

{% play_button "Play Sound" "example4.run(0.1,0.9,0.99)" %}

Try alternating between the previous demo and this one to see the difference. Note that the feel of this
envelope can be modified by playing with the values I chose above. Check out the examples below to see
how you can get quite different sounds, not by modifying frequency or length in any way, but just by
playing with the sound's envelope:

![Picturing sound envelopes](sound-envelopes.png)

{% play_button "00, 10, 90, 99" "example4.run(0.1,0.9,0.99)" %}
{% play_button "00, 70, 90, 99" "example4.run(0.7,0.9,0.99)" %}
{% play_button "00, 20, 40, 99" "example4.run(0.2,0.4,0.99)" %}
{% play_button "00, 05, 20, 99" "example4.run(0.05,0.2,0.99)" %}

## Some notes about frequency

The frequency of a note is measured in Hz, or cycles per second. Exactly how pitch and frequency work,
and musical theories behind what notes sound good together, all of that is out of scope for this tutorial;
let's just assume you have some idea what you'd like to play - maybe a simple melody like "C, E, G, F".

Luckily, there's a pretty easy way to play just notes - we can use the _A440 pitch_, which is the musical
note of A above middle C on a standard grand piano, and _detune_ it. That means that instead of attempting
to calculate frequencies directly, we can provide a detune value from A440, like this:

```javascript
o.frequency.value = 440;
o.detune.value = 100;
```

A detune value is provided in _cents_, or hundredths of a pitch. There are twelve _pitches_ on the chromatic
scale, which is the scale you see on a piano - `A`, `A sharp`, `B`, `C`, `C sharp`, `D`, `D sharp`, `E`, `F`, `F sharp`,
`G`, `G sharp`, and then looping back to A again. Knowing this, you can construct a simple detune table
for the notes you'd like to play:

| Note         | Detune   |
| ------------ | -------- |
| A            | 0        |
| A# (sharp)   | 100      |
| B            | 200      |
| C            | 300      |
| C#           | 400      |
| D            | 500      |
| D#           | 600      |
| E            | 700      |
| F            | 800      |
| F#           | 900      |
| G            | 1000     |
| G#           | 1100     |

If you'd like to keep going up or down, just add or subtract 1200 to move up or down an octave.

Let's use this new information to update our `play` function, and play the first few notes of "Mary Had A Little Lamb":

```js
function play(node, note, start, length) {
    var o = node.context.createOscillator();
    o.connect(node);

    // Always set frequency to 440 now
    o.frequency.value = 440;

    // Use the parameter "note" to detune the frequency
    o.detune.value = note;

    // Create a simple "envelope" for our sound
    node.gain.setValueAtTime(0, start);
    node.gain.linearRampToValueAtTime(1, start + length * 0.1);
    node.gain.setValueAtTime(1, start + length * 0.9);
    node.gain.linearRampToValueAtTime(0, start + length * 0.99);

    o.start(start);
    o.stop(start + length);
}

// A, G, F, G, A, A, A
[0, -2, -4, -2, 0, 0, 0].forEach(function (value, idx) {
    play(node, value * 100, ctx.currentTime + idx * 0.3, 0.3);
});
```

{% play_button "Play Sound" "example5.run()" %}

{% note %}
**Math Tip:** In case you need it, it is pretty easy to calculate frequencies based on cents yourself. Note that
cents represent a _difference between two frequencies_. Given an initial frequency `f1`, and a cents value `c`,
you can compute the modified frequency `f2 = f1 * Math.pow(2, c / 100)`.
{% endnote %}

## Playing overlapping notes

Sometimes it's nice to play some overlapping notes. That would be difficult with our current code, because
we're modifying the volume to represent our sound's envelope; we can't have two different notes trying to
control the volume at the same time.

In order to fix this, you can create multiple gain nodes, and rotate between them, ensuring that only one
note is controlling the volume of that node at a time. Let's try it by making our notes above overlap:

```js
// Let's create a single primary gain node for overall music volume.
// You can turn this up or down to control the music overall.
var musicVolume = ctx.createGain();
musicVolume.connect(ctx.destination);

// Now let's create some individual gain nodes. We'll hook these up
// to the music volume node. Each one is used to control the envelope
// of our notes. Three note nodes should be plenty for our demo.
var noteNodes = [1, 2, 3].map(function () {
    var node = ctx.createGain();
    node.connect(musicVolume);
    return node;
});

var index = 0;

// A, G, F, G, A, A, A
[0, -2, -4, -2, 0, 0, 0].forEach(function (value, idx) {
    play(noteNodes[index], value * 100, ctx.currentTime + idx * 0.25, 0.4);
    index = (index + 1) % noteNodes.length;
});
```

{% play_button "Play Sound" "example6.run()" %}

## Scheduling your song

In the real world, you typically don't want to schedule an entire song's worth of notes ahead of time. You want
to be able to start and stop, you probably want to be able to loop around to the beginning if you reach the
end, etc.

To accomplish this, you can have a function that you call periodically (perhaps on a timer, or in a game,
during your frame handling in your `requestAnimationFrame` callback). Here's an example of what that might
look like:

```js
var song = [
    // ... lots of notes to schedule over time ...
];

// Keep track of when to play the next note, and what note to play
var nextNote = 0;
var nextNoteTick = 0;

// Constant (depends on your project)
var noteLength = 0.2;

// The scheduleNotes function should be called many times per second
// (on a timer, animation frame, or other similar mechanism).
function scheduleNotes() {
    // If we're within half a second of needing the next note to play,
    // we'll schedule it.
    if (ctx.currentTime > nextNoteTick - 0.5) {
        play(volumeNode, song[nextNote], nextNoteTick, nextNoteTick + noteLength);

        nextNote = (nextNote + 1) % song.length;
        nextNoteTick += noteLength;
    }
}
```

{% note %}
Make sure to test how your game or application responds to minimizing the browser and changing tabs.
As a general rule, the audio context will continue to play any scheduled notes, but all animation
frames will pause. This will mean that if you rely on animation frames to play your music, it'll
stop playing when the user switches tabs. More importantly, it means that when you come back to
your tab, your `nextNoteTick` value may be minutes _behind_ `ctx.currentTime`. The best thing to do
in this case is to check for it in your function, and fast-forward `nextNoteTick` to the
current time if it is more than a second or two behind.
{% endnote %}

## Next steps

This guide only scratches the surface of what's possible with the Web Audio API.
I recommend jumping into a more general tutorial, like [Getting Started with Web
Audio API](https://www.html5rocks.com/en/tutorials/webaudio/intro/), to get a larger-scale overview.

Another option is to use a pre-existing music library created especially for small
games - check out the [js13k Resources](https://js13kgames.github.io/resources/) page for some ideas.

<script>
    function createAudioContext() {
        var AudioClass = window.AudioContext || window.webkitAudioContext();
        if (AudioClass) {
            return new AudioClass();
        }
    }

    var example1 = {
        run: function () {
            var ctx = new AudioContext();
            var o = ctx.createOscillator();
            o.connect(ctx.destination);
            o.frequency.value = 270;
            o.start(ctx.currentTime);
            o.stop(ctx.currentTime + 0.5);
        }
    };

    var example2 = {
        run: function () {
            var ctx = new AudioContext();
            var o1 = ctx.createOscillator();
            o1.connect(ctx.destination);
            o1.frequency.value = 270;
            o1.start(ctx.currentTime);
            o1.stop(ctx.currentTime + 0.5);

            var o2 = ctx.createOscillator();
            o2.connect(ctx.destination);
            o2.frequency.value = 300;
            o2.start(ctx.currentTime + 0.5);
            o2.stop(ctx.currentTime + 1);

            var o3 = ctx.createOscillator();
            o3.connect(ctx.destination);
            o3.frequency.value = 330;
            o3.start(ctx.currentTime + 1);
            o3.stop(ctx.currentTime + 1.5);
        }
    };

    var example3 = {
        run: function () {
            var ctx = new AudioContext();

            function play(node, frequency, start, length) {
                var o = node.context.createOscillator();
                o.connect(node);
                o.frequency.value = frequency;
                o.start(start);
                o.stop(start + length);
            }

            play(ctx.destination, 274.17, ctx.currentTime + 0.0, 0.2);
            play(ctx.destination, 308.06, ctx.currentTime + 0.2, 0.2);
            play(ctx.destination, 346.13, ctx.currentTime + 0.4, 0.2);
            play(ctx.destination, 366.90, ctx.currentTime + 0.6, 0.2);
        }
    };

    var example4 = {
        run: function (a, b, c) {
            var ctx = new AudioContext();

            var node = ctx.createGain();
            node.connect(ctx.destination);

            function play(node, frequency, start, length) {
                var o = node.context.createOscillator();
                o.connect(node);
                o.frequency.value = frequency;

                // Create a simple "envelope" for our sound
                node.gain.setValueAtTime(0, start);
                node.gain.linearRampToValueAtTime(1, start + length * a);
                node.gain.setValueAtTime(1, start + length * b);
                node.gain.linearRampToValueAtTime(0, start + length * c);

                o.start(start);
                o.stop(start + length);
            }

            play(node, 274.17, ctx.currentTime + 0.0, 0.2);
            play(node, 308.06, ctx.currentTime + 0.2, 0.2);
            play(node, 346.13, ctx.currentTime + 0.4, 0.2);
            play(node, 366.90, ctx.currentTime + 0.6, 0.2);
        }
    };

    var example5 = {
        run: function () {
            var ctx = new AudioContext();

            var node = ctx.createGain();
            node.connect(ctx.destination);

            function play(node, note, start, length) {
                var o = node.context.createOscillator();
                o.connect(node);
                o.frequency.value = 440;
                o.detune.value = note;

                // Create a simple "envelope" for our sound
                node.gain.setValueAtTime(0, start);
                node.gain.linearRampToValueAtTime(1, start + length * 0.1);
                node.gain.setValueAtTime(1, start + length * 0.9);
                node.gain.linearRampToValueAtTime(0, start + length * 0.99);

                o.start(start);
                o.stop(start + length);
            }

            // A, G, F, G, A, A, A
            [0, -2, -4, -2, 0, 0, 0].forEach(function (value, idx) {
                play(node, value * 100, ctx.currentTime + idx * 0.3, 0.3);
            });
        }
    };

    var example6 = {
        run: function () {
            var ctx = new AudioContext();

            var musicVolume = ctx.createGain();
            musicVolume.connect(ctx.destination);

            var noteNodes = [1, 2, 3].map(function () {
                var node = ctx.createGain();
                node.connect(musicVolume);
                return node;
            });

            var index = 0;

            function play(node, note, start, length) {
                var o = node.context.createOscillator();
                o.connect(node);
                o.frequency.value = 440;
                o.detune.value = note;

                // Create a simple "envelope" for our sound
                node.gain.setValueAtTime(0, start);
                node.gain.linearRampToValueAtTime(1, start + length * 0.1);
                node.gain.setValueAtTime(1, start + length * 0.9);
                node.gain.linearRampToValueAtTime(0, start + length * 0.99);

                o.start(start);
                o.stop(start + length);
            }

            // A, G, F, G, A, A, A
            [0, -2, -4, -2, 0, 0, 0].forEach(function (value, idx) {
                play(noteNodes[index], value * 100, ctx.currentTime + idx * 0.25, 0.4);
                index = (index + 1) % noteNodes.length;
            });
        }
    };
</script>
