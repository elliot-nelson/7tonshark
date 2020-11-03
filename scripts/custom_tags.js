'use strict';

function classLink([className, title, url], context) {
  return `<a class="${className}" href="${url}">${title}</a>`;
}

function playLink([title, url], content) {
  return '<p class="center">' + classLink(['play-link', `${title} <i class="fas fa-play"></i>`, url], content) + '</p>';
}

function playButton([title, onclick], content) {
  return `<p class="center"><button class="play-link" onclick="${onclick}">${title} <i class="fas fa-play"></i></button></p>`;
}

function note(args, content) {
  content = hexo.render.renderSync({ text: content, engine: 'markdown' });
  content = content.replace(/^<p>/, '<p class="note-p"><span class="note-p"><i class="fas fa-info"></i></span>');
  return content;
}

hexo.extend.tag.register('class_link', classLink);
hexo.extend.tag.register('play_link', playLink);
hexo.extend.tag.register('play_button', playButton);
hexo.extend.tag.register('note', note, { ends: true });
