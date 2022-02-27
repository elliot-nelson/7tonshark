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

* [V8 function optimization](https://erdem.pl/2019/08/v-8-function-optimization) by [Kemal Erdem](https://twitter.com/burnpiro)
* [Are We Really Engineers?](https://www.hillelwayne.com/post/are-we-really-engineers/) by [Hillel Wayne](https://twitter.com/hillelogram)
* [A Criticism of Scrum](https://www.aaron-gray.com/a-criticism-of-scrum/) by Aaron Gray