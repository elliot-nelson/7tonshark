---
title: 7 ton shark
subtitle: The personal website of <a href="/about/">Elliot Nelson</a>.
layout: layouts/base.njk
---

## Recent posts

<ul class="listing">
{%- for page in collections.publish | reverse -%}
  <li>
    <a href="{{ page.url }}">{{ page.data.title }}</a> -
    <time datetime="{{ page.date }}">{{ page.date | dateDisplay("LLLL d, y") }}</time> ·
    <span>
      {%- for tag in page.data.tags -%}
        {%- if tag | visibletag -%}
          <a href="/tags/{{ tag }}">#{{ tag }}</a>{{ '' if loop.last else ', ' }}
        {%- endif -%}
      {%- endfor -%}
    </span>
  </li>
{%- endfor -%}
</ul>

## Links around the web

* [Dungeonomics](https://www.projectmultiplexer.com/category/dungeonomics/) by [Emily Dresner](https://twitter.com/multiplexer)
* [V8 function optimization](https://erdem.pl/2019/08/v-8-function-optimization) by [Kemal Erdem](https://twitter.com/burnpiro)
* [Are We Really Engineers?](https://www.hillelwayne.com/post/are-we-really-engineers/) by [Hillel Wayne](https://twitter.com/hillelogram)
* [A Criticism of Scrum](https://www.aaron-gray.com/a-criticism-of-scrum/) by Aaron Gray
