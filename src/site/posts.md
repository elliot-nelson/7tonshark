---
title: Posts
layout: layouts/base.njk
---
<ul class="listing">
{%- for page in collections.post | reverse -%}
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
