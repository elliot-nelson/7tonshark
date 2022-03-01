---
pagination:
  data: collections
  size: 1
  alias: tag
permalink: /tags/{{ tag }}/
layout: layouts/base.njk
---
{%-
  set tagDescriptions = {
    'cicd': 'Posts about CI/CD, pipelines, and build tools.',
    'dev': 'Posts about software development.',
    'gamedev': 'Posts about amateur game development.'
  }
-%}
<h1>#{{ tag }}</h1>

_{{ tagDescriptions[tag] or 'Posts about ' + tag + '.' }}_

<ul class="listing">
{%- for page in collections[tag] | reverse -%}
  <li>
    <a href="{{ page.url }}">{{ page.data.title }}</a> -
    <time datetime="{{ page.date }}">{{ page.date | dateDisplay("LLLL d, y") }}</time> ·
    <ul class="post-tags">
      {%- for tag in page.data.tags -%}
        {%- if tag !== 'post' -%}
          <a href="/tags/{{ tag }}">#{{ tag }}</a>{{ '' if loop.last else ', ' }}
        {%- endif -%}
      {%- endfor -%}
    </ul>
  </li>
{%- endfor -%}
</ul>
