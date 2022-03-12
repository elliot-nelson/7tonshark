---
title: Posts
layout: layouts/base.njk
---
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
