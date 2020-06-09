---
title: Smoother gulp advzip
tags: [javascript, js13k, gulp]
redirect_from:
  - /smoother-gulp-advzip/
---

## Streamline advzip usage in your gulp build

A quick tip: if you use `advzip` in your build pipeline, you can now streamline it by using the
new [gulp-advzip](https://www.npmjs.com/package/gulp-advzip) plugin.

```javascript
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
