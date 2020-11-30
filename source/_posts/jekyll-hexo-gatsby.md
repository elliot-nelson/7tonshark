---
title: Jekyll, Hexo & Gatsby
date: 2020-11-30
tags: [jekyll, hexo, gatsby]
---

After (finally) deploying the blog redesign, I wanted to write down some thoughts on the tech I've tried.

- *Jekyll* - Of the three listed, I think this is actually the best, most reliable blogging platform. In particular, finding and using high quality themes is easy for Jekyll, and if you do need plugins they'll usually work off the shelf. It can be challenging if you aren't already working in Ruby every day to make it play nicely on your system, however. I did end up moving off of Jekyll because I wanted my blog to run on nodejs, but I do miss the quality themes.

- *Gatsby* - This is becoming a pretty popular platform but in my opinion, because it's NOT blog-focused, it actually requires quite a bit of work to make a useable blog on Gatsby. You need to hunt down several key examples and code snippets and put them in the right place, while wrestling with React-isms (if you aren't a React guru) and Gatsby-isms (conventions over and above the usual React-isms). Making a _working_ blog, where posts are written in Markdown, have attached images and files, with good-looking syntax highlighting for code snippets, was a pretty significant undertaking. Things called "themes" do exist in Gatsby, but in my opinion they are not themes the way Jekyll's themes are -- Gatsby is based on React and React is a component-based framework, so the only way to really make a "themed" Gatsby site is to use an existing starter project that kind of looks like a blog. I'm glad I spent some time on it, and I think I will use Gatsby for a different project I'm starting soon, but I chose not to use this platform for my blog.

- *Hexo* - The big advantage to Hexo for a Jekyll user is that in many ways, Hexo is "Jekyll but in node". Most of the core concepts and folder structures are the same, a lot of the configuration is similar, and you can use most of your markdown intact. Jekyll had some additional markdown that doesn't work in Hexo, but you can write _custom tags_ and use them in your markdown, which I have done to replace some of that functionality. For theming, Hexo has Jekyll-style themes, but they are not as well curated -- and interestingly, Hexo seems very popular in China, so a lot of themes and websites about themes are not written in English (this can sometimes make it hard to tell exactly what features a theme has). For the redesign I ended up using `clean-blog` and then further tweaking it (this is a Hexo theme that was ported from a Jekyll theme, so it had a very familiar look).

The end result is that I can toss some markdown into a new file to make a blog post, I can customize markdown when necessary with a little bit of javascript (in nodejs), and I can dive into the theme folder and tweak CSS/HTML when necessary. For me, that feels just about right.
