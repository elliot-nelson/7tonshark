---
title: Streamline advzip usage in your gulp build
tags: [javascript, js13k, gulp]
date: 2018-11-03
alias:
- /2018-11-03-smoother-gulp-advzip/
---

A quick tip: if you use `advzip` in your build pipeline, you can now streamline it by using the
new [gulp-advzip](https://www.npmjs.com/package/gulp-advzip) plugin.

``` js gulpfile.js
const zip = require('gulp-zip');
const advzip = require('gulp-advzip');

gulp.task('zip', () => {
    return gulp.src(['my files...'])
        .pipe(zip('archive.zip'))
        .pipe(advzip())
        .pipe(gulp.dest('out'));
});
```

Installing `gulp-advzip` in your project will automatically download or build an appropriate version
of the advzip binary for you, similar to the [imagemin-advpng](https://www.npmjs.com/package/imagemin-advpng)
package, so there's no need to worry about the usual installation steps.
