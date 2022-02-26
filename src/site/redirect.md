---
# This file does hijinx with the "pagingation" system to generate many small pages from one set of data...
# and uses that do to redirects from some URLs to others.
# We use this to try to keep old links working.
#
# There's limited power to this approach (it only works for specific pages listed; it can't glob),
# but those are limitations inherent to an approach that works via static site gen, rather than via server configuration.
# The related upside of an approach that works via static site gen is the portability.
pagination:
  data: redirects
  size: 1
  alias: redirect
# Add your redirection tuples to this list!
redirects:
  - {"from": "/archives/", "to": "/posts/"}
  - {"from": "/making-vs-maintaining/", "to": "/posts/making-vs-maintaining/"}
permalink: "{{ redirect.from }}"
layout: layouts/redirect.njk
---
(this space purposely left blank)
