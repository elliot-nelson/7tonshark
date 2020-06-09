---
title: Smoother gulp advpng
tags: [javascript, js13k, gulp]
redirect_from:
  - /smoother-gulp-advpng/
---

## Streamline advpng usage in your gulp build

This is a spiritual successor to my previous post, [Smoother gulp advzip]({% post_url 2018-11-03-smoother-gulp-advzip %}).

A quick tip: if you use `advpng` in your build pipeline, note that you can now pass the iterations (`--iter`) option
through the [imagemin-advpng](https://github.com/imagemin/imagemin-advpng) plugin. If you haven't used it before, it
looks something like this:

```javascript
    // gulpfile.js

    const imagemin = require('imagemin');
    const advpng = require('imagemin-advpng');

    gulp.task('mytask', () => {
        return gulp.src(['assets/*.png'])
            .pipe(imagemin({ use: advpng({ optimizationLevel: 4 }) }))
            .pipe(gulp.dest('out'));
    });
```

Using the latest version of imagemin-advpng, you can now specify iterations as well; ideal for that last-pass
squeeze-everything-we-possibly-can build of your js13k project:

```javascript
        return gulp.src(['assets/*.png'])
            .pipe(imagemin({ use: advpng({ optimizationLevel: 4, iterations: 5000 }) }))
            .pipe(gulp.dest('out'));
```

