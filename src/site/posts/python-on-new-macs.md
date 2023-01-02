---
title: Enabling Python on new Macs
subtitle: How to fix the "missing Python 2.7" problem on new machines.
description: How to fix the "missing Python 2.7" problem on new machines.
tweets: ['1609965125053845505']
date: 2023-01-03
tags: [publish, dev]
---

I recently had to setup a new MacBook for work and almost immediately ran into an issue while installing NPM dependencies for a project. Sure enough, it was due to missing Python 2.7 in the base MacOS. (The most common culprit is `node-sass`, due to its widespread usage on older projects, but I'm sure there are others.)

Luckily there is a very easy fix for this: any NPM install dependency requiring Python nowadays should work fine on Python 3, so you can symlink `python` to `python3` and avoid the hassle of installing Python 2.7 or equivalent. The only caveat here is that `node-sass` in particular uses `env python`, so it's important to symlink the _right Python_.

If you haven't already, install the Xcode Command-Line Tools, and then make sure Xcode's Python3 is installed:

```bash
xcode-select --install
ls $(xcode-select -p)/usr/bin/python3
# => /Library/Developer/CommandLineTools/usr/bin/python3
```

I like to create a generic folder, `~/bin`, that I add to my PATH. I toss any miscellaneous scripts or tools that I use globally into this folder. (You can use any similar folder as long as it is part of your PATH.)

```bash
mkdir ~/bin
cd ~/bin
ln -s $(xcode-select -p)/usr/bin/python3 python
env python --version
# => Python 3.9.6
```

If you created this folder above, don't forget to add it the _beginning_ of your path by adding the following to your `~/.zshrc`:

```bash
export PATH=~/bin:$PATH
```

Reload your Terminal window and re-run your npm install command -- python post-install scripts should now work without issue.

> The long term fix here is to eliminate reliance on Python 2.7. For example, in the case of [node-sass](https://www.npmjs.com/package/node-sass), which is no longer in active development, you can replace it with the pure-javascript [sass](https://www.npmjs.com/package/sass) package. However, other libraries may have more complicated upgrade paths.
