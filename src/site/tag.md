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
    'gamedev': 'Posts about amateur game development.',
    'github': 'Posts about GitHub.',
    'azure': 'Posts about Azure DevOps.',
    'powershell': 'Posts about PowerShell.',
    'bash': 'Posts about Bash.',
    'cdk': 'Posts about AWS CDK.',
    'typescript': 'Posts about Typescript.'
  }
-%}
<h1>#{{ tag }}</h1>

_{{ tagDescriptions[tag] or 'Posts about ' + tag + '.' }}_

<ul class="listing">
{%- for page in collections[tag] | reverse -%}
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
