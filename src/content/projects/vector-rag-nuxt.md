---
title: VectorRAGNuxt
summary: Learning vector search and retrieval-augmented generation with Nuxt and MongoDB, using real car data.
repo: https://github.com/ClarkGH/VectorRAGNuxt
stack: [Nuxt, Node, MongoDB Vector Search, OpenAI API]
status: experiment
image: ../../assets/projects/vector-rag-nuxt.png
imageAlt: "The search page at phone width: a navy header with a search box containing \"okayest car ever\", then ranked result cards with match bars: Ford Mustang at 74%, Yester Year Auto Coupe at 73% and Kia Optima at 73%."
order: 3
---

A hands-on study of vector databases and RAG. You describe a car in plain language and get back the closest real matches.

## What's in it

- **A data scraper** pulls model data from the NHTSA vPIC API, filterable by year range and make.
- **MongoDB as the vector store.** Scraped records are embedded and searched by similarity.
- **A Nuxt front end** takes the prompt and shows the results.

## Status

Search works end to end: scraped models are seeded into MongoDB, and a plain-language description comes back as the closest matches with a score. The results are still rough (a "medium sedan" search turns up an SL-Class roadster), so tuning what gets embedded is next.
