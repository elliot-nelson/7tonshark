---
title: 7 ton shark
subtitle: The personal website of <a href="/about/">Elliot Nelson</a>.
layout: layouts/base.njk
---

## Recent posts

<ul class="listing">
{%- for page in collections.post.slice(0, 10) | reverse -%}
  <li>
    <a href="{{ page.url }}">{{ page.data.title }}</a> -
    <time datetime="{{ page.date }}">{{ page.date | dateDisplay("LLLL d, y") }}</time> ·
    <ul class="post-tags">
      {%- for tag in page.data.tags -%}
        {%- if tag !== 'post' -%}
          <li><a href="/tags/{{ tag }}">#{{ tag }}</a></li>
        {%- endif -%}
      {%- endfor -%}
    </ul>
  </li>
{%- endfor -%}
</ul>

## Links around the web

* [Are We Really Engineers?](https://www.hillelwayne.com/post/are-we-really-engineers/) by Hillel Wayne
* [A Criticism of Scrum](https://www.aaron-gray.com/a-criticism-of-scrum/) by Aaron Gray
