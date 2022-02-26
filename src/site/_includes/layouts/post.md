---
layout: layouts/base.njk
pageClass: posts
templateEngineOverride: njk, md
---

<p class="date">
  <time datetime="{{ date }}">{{ date | dateDisplay }}</time> ·
  <span>
  {%- for post in collections.post -%}
    {%- if page.url === post.url -%}
      {%- for tag in post.data.tags -%}
        {%- if tag !== 'post' -%}
          <a href="/tags/{{ tag }}/">#{{ tag }}</a>
        {%- endif -%}
      {%- endfor -%}
    {%- endif -%}
  {%- endfor -%}
  </span>
</p>
<main>
  {{ content | safe }}
</main>
