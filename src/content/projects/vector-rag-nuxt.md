---
title: VectorRAGNuxt
summary: Learning vector search and retrieval-augmented generation with Nuxt and MongoDB, using real car data.
repo: https://github.com/ClarkGH/VectorRAGNuxt
stack: [Nuxt, Node, MongoDB Vector Search, OpenAI API]
status: experiment
image: ../../assets/projects/vector-rag-nuxt.png
imageAlt: "The search page at phone width: a search for \"small honda hatchback\", an AI summary saying all 5 results fit, and the top result, the Honda Fit marked \"Strong match\", with a blue edge and an AI pick note explaining why it fits."
order: 3
---

A hands-on study of vector databases and RAG. You describe a car in plain language and get back the closest real matches.

## What's in it

- **A data scraper** pulls model data from the NHTSA vPIC API, filterable by year range and make.
- **MongoDB as the vector store.** Scraped records are embedded and searched by similarity.
- **A Nuxt front end** takes the prompt and shows the results.
- **An AI answer**, the "G" in RAG: on request, gpt-5-mini marks which results fit your search and why. Code checks every answer before it's shown.

## Status

Search and the AI answer both work end to end. Adding short AI-written descriptions to each car made search much better: on a set of searches I labeled by hand, the ranking score went from 0.82 to 0.99.

The answer can only pick from the cars the search found, and a check in code throws out any answer that names a car it wasn't given. That check earned its keep. Told never to mention outside cars, the model still compared against a Ford Mustang when a search asked it to. Testing also taught me that the government's "passenger cars" include a few SUVs, which I had confidently told the AI they didn't. Lesson learned: check the data before the data checks you.
