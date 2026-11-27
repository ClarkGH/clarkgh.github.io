---
title: VectorRAGNuxt
summary: Describe a car in plain words and it finds the closest real models. Built to learn RAG, with MongoDB vector search, checked AI answers and an MCP server.
repo: https://github.com/ClarkGH/VectorRAGNuxt
stack: [Nuxt, TypeScript, MongoDB Vector Search, OpenAI API, MCP]
status: done
image: ../../assets/projects/vector-rag-nuxt.png
imageAlt: "The search page at phone width: a search for \"small honda hatchback\", an AI summary saying all 5 results fit, and the top result, the Honda Fit marked \"Strong match\", with a blue edge and an AI pick note explaining why it fits."
order: 3
---

Describe a car in plain words, like "small electric car" or "2018 accord," and it finds the closest real models in government data. I built it to learn retrieval-augmented generation (RAG) end to end: getting the data, searching it, measuring whether a change actually helped, and letting an AI answer without making things up.

## Status

Done. Search, the AI answer and the MCP server all work end to end, with unit and integration tests.

The biggest win was a cheap one: adding a short AI-written description to each car took the ranking score (nDCG@5) on my hand-labeled searches from 0.82 to 0.99.

Where I stopped: search still stumbles on some everyday phrasing, like "gas efficient car," and it's built to run on my own computer, not the public internet.

## Technical details

- **The data.** A scraper pulls makes, models and years from the NHTSA vPIC API: 475 models from 66 manufacturers. gpt-5-mini writes a short description of each one, and code checks each description before it's saved.
- **Retrieval.** Each model is embedded with OpenAI's `text-embedding-3-small` and stored in MongoDB Atlas Vector Search, running locally in Docker. Put a year in the search and results are filtered to it.
- **Measurement.** A set of searches I labeled by hand scores every change (nDCG, Hit@1, MRR), and the rules for calling it a win, a loss or too close to call are set before the run.
- **The AI answer,** the "G" in RAG. On request, gpt-5-mini marks which results fit your search and why. It can only pick from what the search found, and code checks every answer before it's shown. A test run checks that it stays grounded, refuses when nothing fits, and resists prompt injection.
- **An MCP server.** The same search is a `search_cars` tool, so an AI assistant like Claude Code can use it. It reuses the page's search code and input checks, and it can only read.
- **A Nuxt front end** that shows how well each result matches in words (Strong, Possible, Weak) instead of a raw score nobody can interpret.

The checks earned their keep. Told never to mention cars outside the results, the model still compared against a Ford Mustang when a search asked it to, and the check threw that answer out. Testing also showed that the government's "passenger cars" include a few SUVs, which I had confidently told the AI they didn't. Lesson learned: check the data before the data checks you.

MCP taught the same lesson from the other side. The first time Claude Code used the tool, it answered from the results, then added on its own that one car was "only available used." That may be true, but it isn't in my data. The server controls what goes in, and the assistant owns what comes out.
