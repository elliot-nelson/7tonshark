#!/usr/bin/env node

// tools/generate-banner.js
// Usage: node tools/generate-banner-imagejs <path-to-md-file>
//
// Calls a customized local version of ray-so to generate a PNG
// image from it. For more information,
// see: https://github.com/elliot-nelson/ray-so/tree/zzt.

const fs = require('fs');
const path = require('path');

function fixFiles(markdownPath) {
  const match = markdownPath.match(/[^/]+(.+)\.md$/);
  const mdName = match ? match[1] : null;
  if (!mdName) {
    throw new Error(`Invalid markdown file path: ${markdownPath}`);
  }
  const baseName = path.basename(markdownPath, '.md');
  const dirName = path.dirname(markdownPath).split('/').pop();
  console.log(baseName, dirName);
  if (dirName === baseName) {
    return markdownPath;
  }

  console.log('Creating new folder for post...');
  fs.mkdirSync(path.dirname(markdownPath) + '/' + baseName);
  fs.moveSync(markdownPath, path.dirname(markdownPath) + '/' + baseName + '/' + baseName + '.md', { overwrite: true });

  return path.dirname(markdownPath) + '/' + baseName + '/' + baseName + '.md';
}

function main() {
  let file = process.argv[2];
  if (!file) {
    console.error('Usage: node tools/generate-banner.js <path-to-md-file>');
    process.exit(1);
  }
  file = fixFiles(file);

  const bannerOutputPath = path.dirname(file) + '/' + 'banner.txt';

  if (!fs.existsSync(bannerOutputPath)) {
    console.error(`Banner file does not exist: ${bannerOutputPath}`);
    process.exit(1);
  }

  const imageOutputPath = path.dirname(file) + '/' + 'banner.png';

  // Execute banner generation:
  //   FROM banner.txt
  //   TO banner.png
  //   SCRIPT: ../../ray-so/scripts/generate-image.js <FROM> <TO>
  try {
    const { execSync } = require('child_process');
    execSync(`node ${__dirname}/../../ray-so/scripts/generate-image.js "${bannerOutputPath}" "${imageOutputPath}"`, { stdio: 'inherit' });
  } catch (err) {
    console.error('Error generating image:', err);
    process.exit(1);
  }

  console.log(`Image generated at: ${imageOutputPath}`);
}

main();
