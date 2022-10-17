---
title: Simple interactive music with SoundBox
description: Fade in and out individual tracks of a SoundBox song to make your game feel more interactive.
tags: [publish, gamedev, js13k]
tweets: ['1582061043244638208']
date: 2022-10-17
---

For my [2022 js13k entry](/posts/making-of-js13k-2022-moth), I used the [SoundBox](https://sb.bitsnbites.eu/) tracker to compose my background music -- really just an ambient background loop, a few long wind noises and some random percussion. I've wanted for a while to make a game with music that was more interactive, and this year's entry is the perfect time to try it.

There are [different ways to make music interactive](https://gamedev.stackexchange.com/questions/61564/changing-background-music-smoothly), but in this article I'm making use of "layers" -- the full song will have some tracks that are muted by default, and we'll bring them in and out depending on the situation.

## Tweaking the player

By default, the SoundBox player builds the entire song and gives it to us as an audio buffer. If we're going to control the volume (_gain_) on individual tracks, we need to change that.

In the top section, we'll add a new array to hold our channel buffers:

```javascript
    var mSong, mLastRow, mCurrentCol, mNumWords, mMixBuf, mChannelBufs;
```

We'll initialize it in the `init()` function:

```javascript
        mChannelBufs = [];

        for (let i = 0; i < song.numChannels; i++) {
            mChannelBufs.push(new Int32Array(mNumWords));
        }
```

And then down in the `generate()` function, we'll save the output to these buffers in addition to the "full" song buffer:

```javascript
                    // ...and add to stereo mix buffer
                    mMixBuf[k] += lsample | 0;
                    mMixBuf[k+1] += rsample | 0;

                    // ...and channel (this is new)
                    mChannelBufs[mCurrentCol][k] += lsample | 0;
                    mChannelBufs[mCurrentCol][k+1] += rsample | 0;
```

Now, down in the `createAudioBuffer()` function, we can optionally take a channel number, to get just one track instead of all of the tracks mixed together:

```javascript
    this.createAudioBuffer = function(context, channelNumber) {
        let source = channelNumber === undefined ? mMixBuf : mChannelBufs[channelNumber];

        var buffer = context.createBuffer(2, mNumWords / 2, 44100);
        for (var i = 0; i < 2; i ++) {
            var data = buffer.getChannelData(i);
            for (var j = i; j < mNumWords; j += 2) {
                data[j >> 1] = mMixBuf[j] / 65536;
                data[j >> 1] = source[j] / 65536;
            }
        }

        return buffer;
    };
```

> Check out the [commit on GitHub](https://github.com/elliot-nelson/js13k-2022-moth/commit/ba4761eff2d8f82b923a4b477657dbebca1e1120) to see these changes in context.

## Loading a song track-by-track

Now that the SoundBox player is able to generate track-by-track buffers, we can use them to create individual _buffer audio sources_ attached to individual _gain nodes_ (a gain node is what we'll use to control volume for each track).

Previously, my song-loading code looked like this:

```javascript
    let buffer = this.player.createAudioBuffer(Audio.ctx);
    this.songSource = Audio.ctx.createBufferSource();
    this.songSource.buffer = buffer;
    this.songSource.loop = true;
    this.songSource.connect(Audio.gain_);
    this.songSource.start();
```

We're going to change this to loop through each track ("channel", as SoundBox calls it), make an audio buffer and a gain node, and wire them up. After all of the buffers and nodes are created, _then_ we'll pick a single time to start playing all the buffers simultaenously. (We don't start each buffer as we create it, because we don't know exactly how long these buffers will take to create -- even if each buffer only takes 40-50ms, the end result would be a subtle "staggering" of our different tracks that would make it sound out-of-sync).

```javascript
    this.musicGainNodes = [];
    this.songSources = [];

    for (let i = 0; i < song.numChannels; i++) {
        let buffer = this.player.createAudioBuffer(Audio.ctx, i);
        let bufferSource = Audio.ctx.createBufferSource();

        let gainNode = Audio.ctx.createGain();
        gainNode.connect(Audio.gain_);
        this.musicGainNodes.push(gainNode);

        bufferSource.buffer = buffer;
        bufferSource.loop = true;
        bufferSource.connect(gainNode);
        this.songSources.push(bufferSource);
    }

    this.musicStartTime = Audio.ctx.currentTime + 0.1;

    for (let i = 0; i < song.numChannels; i++) {
        this.songSources[i].start(this.musicStartTime);
    }
```

There! Our song is playing in the background, just like it was before, but now we can interact with those individual gain nodes. For example:

```javascript
// Example: mute first track of the song
this.musicGainNodes[0].gain.value = 0;
```

## Adding some interactive tracks

Time to jump into the actual tracker. I'm going to add two tracks: the first track will start when an enemy wave begins, and the second track will kick in the first time an enemy becomes visible on screen (due to where the enemies randomly spawn, the difference may be 1 second or it could be 10+ seconds, so the first track will hopefully help build up suspense).

To make things easy on myself, I've written out the same short series of notes in both tracks -- you can [open it in SoundBox](https://sb.bitsnbites.eu/?data=U0JveA4C7dm9ahRRFADgc-dvUYRYKekGK8UiQgpBELexEURECyuxDGKZRhJ0rTZsdqsFOxcRwUewsNAHsPYNRLs8wjrZHzWLWthsfr7vcO-cc7kMw5nyFJciVqJuZb3NyHqdImLtypsb23nsFilvv87rYfG0TNnB2IqDXsTR0lmonwUAAAAAAAAn2peNdnzeiPbX4uLl9ab-VqX8_UrU34tbVUQ5MX3qFcwNhz-zv9x4-YcMAAAAAAA4dMaP282KdpStt7OjbBxZfa9cTdVMxHQHjqGBFgAAAAAAcJL1p2s8Go32y_UsZdf2on6QXmV5MY2I6c7ybR3x7-_4hQAAAAAAwKEyG5bdLU6vXW3SD2WkvW7UT8qzk_FYqzHfAZam28R8XPwrn2TbugMAAAAAwH9KnzqRPm6eiqjOXdg_uJmndP5d1Ler1SotGPR3e_PV3enuLNa_v3jQH_T_VQMAAAAAAMCy5eNOxLgf8TzL1q43B4_ylD-8E_X97ExhWAYAAAAAAMBx9gM) to see it for yourself. Tracks 1-5 make up my original song, and new tracks 6 and 7 are now a repeating series of notes (F# F E D#). Track 7 is the "wave" music (using the pipe hit instrument), and track 6 is the "combat" music (using the classic 8-bit instrument).

If I were to save this song and load it up in the game, all 7 tracks would immediately start playing, so we'll want to make some adjustments.

First, a couple of helpful constants:

```javascript
export const TRACK_COMBAT = 5;
export const TRACK_WAVE = 6;
```

In the for loop where we create our audio buffers and gain nodes, we'll mute the two new tracks:

```javascript
            if (i === TRACK_COMBAT || i === TRACK_WAVE) {
                gainNode.gain.value = 0;
            }
```

And now we need a way to start and stop our new tracks:

```javascript
    startWave() {
        if (!this.trackWavePlaying) {
            this.musicGainNodes[TRACK_WAVE].gain.linearRampToValueAtTime(1, Audio.ctx.currentTime + 3);
            this.trackWavePlaying = true;
        }
    },

    startCombat() {
        if (!this.trackCombatPlaying) {
            this.musicGainNodes[TRACK_COMBAT].gain.linearRampToValueAtTime(1, Audio.ctx.currentTime + 2);
            this.trackCombatPlaying = true;
        }
    },

    stopWave() {
        this.musicGainNodes[TRACK_WAVE].gain.linearRampToValueAtTime(0, Audio.ctx.currentTime + 3);
        this.musicGainNodes[TRACK_COMBAT].gain.linearRampToValueAtTime(0, Audio.ctx.currentTime + 2);
        this.trackWavePlaying = this.trackCombatPlaying = false;
    }
```

Now all we need to do is hook up the appropriate function calls to the game logic that controls the wave and enemy behavior.

Try it out below!

<script language="javascript" src="player-small.js"></script>
<script language="javascript" src="WindyCave.js"></script>
<script language="javascript">
window.Audio = {
    getAudioContext() {
        if (!Audio._ctx) {
            Audio._ctx = new AudioContext();
        }
        return Audio._ctx;
    },
    getPlayer() {
        if (!Audio._player) {
            Audio._player = new CPlayer();
            Audio._player.init(WindyCaveSong);
            while (Audio._player.generate() !== 1) { }
        }
        return Audio._player;
    },
    startOrStop() {
        if (Audio.playing) {
            for (let i = 0; i < WindyCaveSong.numChannels; i++) {
                Audio.bufferSources[i].stop();
            }
            document.getElementById('example1-state').disabled = 'disabled';
            Audio.playing = false;
            document.getElementById('example1-start').innerText = 'Start Music';
        } else {
            const ctx = Audio.getAudioContext();
            const player = Audio.getPlayer();
            Audio.bufferSources = [];
            Audio.gainNodes = [];
            for (let i = 0; i < WindyCaveSong.numChannels; i++) {
                let buffer = player.createAudioBuffer(ctx, i);
                let bufferSource = ctx.createBufferSource();
                let gainNode = ctx.createGain();
                gainNode.connect(ctx.destination);
                bufferSource.buffer = buffer;
                bufferSource.loop = true;
                bufferSource.connect(gainNode);
                Audio.bufferSources.push(bufferSource);
                Audio.gainNodes.push(gainNode);
            }
            Audio.gainNodes[5].gain.value = 0;
            Audio.gainNodes[6].gain.value = 0;
            let time = ctx.currentTime + 0.1;
            for (let i = 0; i < WindyCaveSong.numChannels; i++) {
                Audio.bufferSources[i].start(time);
            }
            Audio.playing = true;
            Audio.state = 0;
            document.getElementById('example1-start').innerText = 'Stop Music';
            document.getElementById('example1-state').disabled = '';
            document.getElementById('example1-state').innerText = 'Track: Wave Starts';
        }
    },
    toggle() {
        if (Audio.state === 0) {
            Audio.gainNodes[6].gain.linearRampToValueAtTime(1, Audio.getAudioContext().currentTime + 3);
            Audio.state = 1;
            document.getElementById('example1-state').innerText = 'Track: Enemy Appears';
        } else if (Audio.state === 1) {
            Audio.gainNodes[5].gain.linearRampToValueAtTime(1, Audio.getAudioContext().currentTime + 2);
            Audio.state = 2;
            document.getElementById('example1-state').innerText = 'Wave Defeated';
        } else if (Audio.state === 2) {
            Audio.gainNodes[5].gain.linearRampToValueAtTime(0, Audio.getAudioContext().currentTime + 2);
            Audio.gainNodes[6].gain.linearRampToValueAtTime(0, Audio.getAudioContext().currentTime + 3);
            Audio.state = 0;
            document.getElementById('example1-state').innerText = 'Track: Wave Starts';
        }
    }
};
</script>
<blockquote style="text-align:center;padding:16px">
  <button class="button-6" id="example1-start" onClick="Audio.startOrStop()">Start Music</button>
  <button class="button-6" id="example1-state" onClick="Audio.toggle()" disabled="disabled">Track: Wave Starts</button>
  <p><i>(Music may take 3-4 seconds to start playing, please be patient.)</i></p>
</blockquote>

## Aligning track start times

If you play with the example above for long enough, you'll notice that it doesn't always sound very good when the new track kicks in. Yes, we're fading in the notes, but because we're fading in from a random point in the pattern, our ears get confused -- it might kick in in the middle of a note (this results in an unpleasant click as the track starts). Or, it might sound like a note, but it's the _wrong_ note -- if the first notes we hear are "E D# F# F", it takes the ear another second or two to realize that it's a repeating series of decreasing notes. Instead of an exciting, suspense-building sound, it just momentarily confuses the player.

We can fix this if we make sure the new tracks only kick in when we want them to -- at the next beginning of our "natural pattern" (in my case, the 4 note run). We can use the value `rowLen`, which is available on the song exported from SoundBox, to calculate this.

> The value `rowLen` represents the number of _samples_ in an individual note (row) in the tracker. The songs SoundBox exports play at 44100hz, or 44100 samples per second, so dividing the `rowLen` into 44100 gives you how long an individual note takes to play, in fractions of a second.
>
> Inside SoundBox this is related to the BPM (beats per minute) setting -- BPM represents how many quarter notes (i.e., every fourth note) plays in a given minute. Because my song is an ambient background track, I have an unusually low setting of 63BPM, which makes my song's `rowLen` an unusually high `10500`.
>
> Either value can be used to calculate the length of notes in your song.
>
> ```text
> From BPM:
> 60 seconds / (63 BPM * 4 notes per beat)   = 0.238 seconds
>
> From Samples:
> 44100 samples per second / 10400 samples   = 0.238 seconds
> ```

Back when we changed up our player code, we saved the time the music started playing in the variable `musicStartTime`. We're going to use that now to help calculate how far into the sequence we currently are, and when the next one will start.

```javascript
    startWave() {
        if (!this.trackWavePlaying) {
            // Calculate the best start time (aka: the F# note in our sequence)
            const sequenceLength = song.rowLen * 4 / 44100;
            const sequencePoint = (Audio.ctx.currentTime - this.musicStartTime) % sequenceLength;
            const startTime = Audio.ctx.currentTime - sequencePoint + sequenceLength;

            // Don't fade in, just cut to full volume for that F# note
            this.musicGainNodes[TRACK_WAVE].gain.setValueAtTime(1, startTime);
            this.trackWavePlaying = true;
        }
    }
```

Let's try it!

<script language="javascript">
window.Audio = {
    ...window.Audio,
    startOrStop2() {
        if (Audio.playing) {
            for (let i = 0; i < WindyCaveSong.numChannels; i++) {
                Audio.bufferSources[i].stop();
            }
            document.getElementById('example2-state').disabled = 'disabled';
            Audio.playing = false;
            document.getElementById('example2-start').innerText = 'Start Music';
        } else {
            const ctx = Audio.getAudioContext();
            const player = Audio.getPlayer();
            Audio.bufferSources = [];
            Audio.gainNodes = [];
            for (let i = 0; i < WindyCaveSong.numChannels; i++) {
                let buffer = player.createAudioBuffer(ctx, i);
                let bufferSource = ctx.createBufferSource();
                let gainNode = ctx.createGain();
                gainNode.connect(ctx.destination);
                bufferSource.buffer = buffer;
                bufferSource.loop = true;
                bufferSource.connect(gainNode);
                Audio.bufferSources.push(bufferSource);
                Audio.gainNodes.push(gainNode);
            }
            Audio.gainNodes[5].gain.value = 0;
            Audio.gainNodes[6].gain.value = 0;
            Audio.startTime = ctx.currentTime + 0.1;
            for (let i = 0; i < WindyCaveSong.numChannels; i++) {
                Audio.bufferSources[i].start(Audio.startTime);
            }
            Audio.playing = true;
            Audio.state = 0;
            document.getElementById('example2-start').innerText = 'Stop Music';
            document.getElementById('example2-state').disabled = '';
            document.getElementById('example2-state').innerText = 'Track: Wave Starts';
        }
    },
    toggle2() {
        const ctx = Audio.getAudioContext();
        // hey
        if (Audio.state === 0) {
            const sequenceLength = WindyCaveSong.rowLen * 4 / 44100;
            const sequencePoint = (ctx.currentTime - Audio.startTime) % sequenceLength;
            const startTime = ctx.currentTime - sequencePoint + sequenceLength;
            Audio.gainNodes[6].gain.setValueAtTime(1, startTime);
            Audio.state = 1;
            document.getElementById('example2-state').innerText = 'Track: Enemy Appears';
        } else if (Audio.state === 1) {
            const sequenceLength = WindyCaveSong.rowLen * 4 / 44100;
            const sequencePoint = (ctx.currentTime - Audio.startTime) % sequenceLength;
            const startTime = ctx.currentTime - sequencePoint + sequenceLength;
            Audio.gainNodes[5].gain.setValueAtTime(1, startTime);
            Audio.state = 2;
            document.getElementById('example2-state').innerText = 'Wave Defeated';
        } else if (Audio.state === 2) {
            Audio.gainNodes[5].gain.linearRampToValueAtTime(0, Audio.getAudioContext().currentTime + 2);
            Audio.gainNodes[6].gain.linearRampToValueAtTime(0, Audio.getAudioContext().currentTime + 3);
            Audio.state = 0;
            document.getElementById('example2-state').innerText = 'Track: Wave Starts';
        }
    }
};
</script>
<blockquote style="text-align:center;padding:16px">
  <button class="button-6" id="example2-start" onClick="Audio.startOrStop2()">Start Music</button>
  <button class="button-6" id="example2-state" onClick="Audio.toggle2()" disabled="disabled">Track: Wave Starts</button>
  <p><i>(Music may take 3-4 seconds to start playing, please be patient.)</i></p>
</blockquote>

Nice... now every time an enemy appears on screen, the combat music is going to start out with that strong F# note.

## Going further

This is where I ended my experiment, but there are other cool things you could do here.

Right now, all of my tracks are playing all the time in the background. You don't _have_ to do it this way -- in theory we could have the wave track ready to play, but not started yet. Because tracks 1-5 are ambient, they don't have to line up pattern-to-pattern with Track 7 (the "wave") track -- we could get away with only lining up on note length. (You would still want to use the sequence calculation we did above when starting Track 6, the combat track).

This type of approach would work great for a game with enemy encounters -- think of Final Fantasy style combat. You could cut from a peaceful exploration song to a fight song, and as long as both are the same BPM and you calculate a note start time, you can do a dramatic instant cutover and it won't sound jarring.

Play with it and have fun!
