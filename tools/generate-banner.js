#!/usr/bin/env node

// tools/generate-banner.js
// Usage: node tools/generate-banner.js <path-to-md-file>

const fs = require('fs');
const path = require('path');

function parseFrontmatter(md) {
  const match = md.match(/^---\n([\s\S]*?)\n---/);
  if (!match) return {};
  const lines = match[1].split(/\r?\n/);
  const meta = {};
  for (const line of lines) {
    const m = line.match(/^([a-zA-Z0-9_-]+):\s*(.*)$/);
    if (m) meta[m[1].trim()] = m[2].trim().replace(/^"|"$/g, '');
  }
  return meta;
}

function wordWrap(text, maxWidth) {
  const words = text.split(' ');
  const lines = [];
  let line = '';
  for (const word of words) {
    if ((line + word).length > maxWidth) {
      lines.push(line.trim());
      line = '';
    }
    line += word + ' ';
  }
  if (line) lines.push(line.trim());
  return lines;
}

function drawBox(lines, width, double) {
  const h = double ? '═' : '─';
  const v = double ? '║' : '│';
  const tl = double ? '╔' : '┌';
  const tr = double ? '╗' : '┐';
  const bl = double ? '╚' : '└';
  const br = double ? '╝' : '┘';
  let box = tl + h.repeat(width - 2) + tr + '\n';
  for (const l of lines) {
    box += v + ' ' + l.padEnd(width - 3, ' ') + v + '\n';
  }
  box += bl + h.repeat(width - 2) + br;
  return box;
}

function drawStarfield(canvas, density = 0.04) {
  const chars = [
    '.',
    '+',
    '*',
    '░',
    '▒',
    '▓',
    '█',
    '■',
    '○',
    //'◌',
    //'□',
    '◆',
    //'◈',
    //'╬',
    //'╳',
    //'╦',
    //'╩',
    //'╠',
    //'╣',
    //'╔',
    //'╗',
    //'╚',
    //'╝',
    //'═',
    //'║',
    //'┼',
    //'┤',
    //'├',
    //'┬',
    //'┴',
    //'┌',
    //'┐',
    //'└',
    //'┘'
  ];
  for (let y = 0; y < canvas.length; y++) {
    for (let x = 0; x < canvas[0].length; x++) {
      if (Math.random() < density) {
        canvas[y][x] = chars[Math.floor(Math.random() * chars.length)];
      }
    }
  }
  // Add some random lines (horizontal, vertical, diagonal)
  for (let i = 0; i < 1; i++) {
    let x = Math.floor(Math.random() * (canvas[0].length - 10));
    let y = Math.floor(Math.random() * (canvas.length - 1));
    let len = 5 + Math.floor(Math.random() * 8);
    //let dir = Math.floor(Math.random() * 3); // 0: horiz, 1: vert, 2: diag
    let dir = 2;
    for (let j = 0; j < len; j++) {
      if (dir === 0) {
        // horizontal
        if (x + j >= 0 && x + j < canvas[0].length && y >= 0 && y < canvas.length) {
          canvas[y][x + j] = '═';
        }
      } else if (dir === 1) {
        // vertical
        if (x >= 0 && x < canvas[0].length && y + j >= 0 && y + j < canvas.length) {
          canvas[y + j][x] = '║';
        }
      } else if (dir === 2) {
        // diagonal
        if (x + j >= 0 && x + j < canvas[0].length && y + j >= 0 && y + j < canvas.length) {
          canvas[y + j][x + j] = '\\';
        }
      }
    }
  }
  // Add a few little galaxies (spirals or blobs)
  /*
  for (let g = 0; g < 2; g++) {
    let cx = 10 + Math.floor(Math.random() * (canvas[0].length - 20));
    let cy = 2 + Math.floor(Math.random() * (canvas.length - 4));
    let r = 2 + Math.floor(Math.random() * 2);
    for (let t = 0; t < 12; t++) {
      let angle = (t / 12) * 2 * Math.PI;
      let x = Math.round(cx + Math.cos(angle) * r + Math.sin(angle * 2));
      let y = Math.round(cy + Math.sin(angle) * r + Math.cos(angle * 2));
      if (x > 0 && y > 0 && x < canvas[0].length && y < canvas.length) {
        canvas[y][x] = '@';
      }
    }
  }
    */
  // Add a "moon with rings"
  let mx = 5 + Math.floor(Math.random() * (canvas[0].length - 15));
  let my = 2 + Math.floor(Math.random() * (canvas.length - 6));
  const moon = ['  ()  ', ' (  ) ', '(    )', ' (  ) ', '  ()  ', ' ~~~  '];
  for (let i = 0; i < moon.length; i++) {
    for (let j = 0; j < moon[i].length; j++) {
      if (moon[i][j] !== ' ' && my + i < canvas.length && mx + j < canvas[0].length) {
        canvas[my + i][mx + j] = moon[i][j];
      }
    }
  }
}

function placeBox(canvas, box, x, y) {
  const lines = box.split('\n');
  for (let i = 0; i < lines.length; i++) {
    if (y + i >= canvas.length) break;
    for (let j = 0; j < lines[i].length; j++) {
      if (x + j >= canvas[0].length) break;
      canvas[y + i][x + j] = lines[i][j];
    }
  }
}

function drawArrow(canvas, x1, y1, x2, y2) {
  // Draw double-single box line junction above the start (left-to-right double, up single)
  if (y1 > 0) {
    canvas[y1 - 1][x1] = '╤';
  }

  // Draw a 90° angle and arrow from (x1, y1) to (x2, y2)
  // We'll go down, then right
  let x = x1,
    y = y1;
  while (y < y2) {
    canvas[y][x] = '│';
    y++;
  }
  canvas[y][x] = '└';
  while (x < x2 - 1) {
    x++;
    canvas[y][x] = '─';
  }
  canvas[y][x + 1] = '>'; // arrowhead
}

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

  const md = fs.readFileSync(file, 'utf8');
  const meta = parseFrontmatter(md);
  const title = meta.title || 'Untitled';
  const description = meta.description || '';

  // Prepare canvas
  const W = 60,
    H = 13;
  const canvas = Array.from({ length: H }, () => Array(W).fill(' '));
  drawStarfield(canvas, 0.1);

  // Title box
  const titleBoxWidth = Math.min(Math.max(title.length + 4, 20), 60);
  const titleBox = drawBox([title], titleBoxWidth, true);
  const titleX = 2,
    titleY = 1;
  placeBox(canvas, titleBox, titleX, titleY);

  // Description box
  const descWrap = wordWrap(description, 42);
  const descBoxWidth = Math.max(...descWrap.map((l) => l.length)) + 4;
  const descBox = drawBox(descWrap, descBoxWidth, false);
  const descX = W - descBoxWidth - 2,
    descY = H - descWrap.length - 4;
  placeBox(canvas, descBox, descX, descY);

  // Arrow from title box to description box
  // Start: under title box, 25% from left
  const titleBoxLines = titleBox.split('\n').length;
  const arrowStartX = titleX + Math.floor(titleBoxWidth * 0.15);
  const arrowStartY = titleY + titleBoxLines;
  // End: directly to the left of desc box, aligned with top of desc box content
  const arrowEndX = descX - 1;
  const arrowEndY = descY + 1;
  drawArrow(canvas, arrowStartX, arrowStartY, arrowEndX, arrowEndY);

  // Print banner
  fs.writeFileSync(bannerOutputPath, canvas.map((row) => row.join('')).join('\n'), 'utf8');
  console.log(`Banner generated at: ${bannerOutputPath}`);
  console.log('Generated Banner:');
  for (const row of canvas) {
    console.log(row.join(''));
  }
}

main();
