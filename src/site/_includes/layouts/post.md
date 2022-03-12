---
layout: layouts/base.njk
pageClass: posts
templateEngineOverride: njk, md
---

<p class="date">
  <time datetime="{{ date }}">{{ date | dateDisplay }}</time> ·
  <span>
  {%- set post = collections.post | getCollectionItem(page) -%}
  {%- if post -%}
    {%- for tag in post.data.tags -%}
      {%- if tag !== 'post' -%}
        <a href="/tags/{{ tag }}">#{{ tag }}</a>{{ '' if loop.last else ', ' }}
      {%- endif -%}
    {%- endfor -%}
  {%- endif -%}
  </span>
</p>
<main>
  {{ content | safe }}
</main>
