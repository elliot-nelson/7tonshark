'use strict';

function classLink([className, title, url], context) {
  return `<a class="${className}" href="${url}">${title}</a>`;
}

function playLink([title, url], context) {
  return '<p style="text-align: center">' + classLink(['play-link', `${title} <i class="fas fa-play"></i>`, url], context) + '</p>';
}

hexo.extend.tag.register('class_link', classLink);
hexo.extend.tag.register('play_link', playLink);
