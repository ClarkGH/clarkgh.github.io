---
title: springvue
summary: A Vue 3 SPA served by a Spring monolith, with a Rust/Actix twin for benchmarking.
repo: https://github.com/ClarkGH/springvue
stack: [Vue 3, Pinia, Spring Boot, Rust, Actix, PostgreSQL]
status: experiment
image: ../../assets/projects/springvue.png
imageAlt: "The Vue todo app: a box for adding todos, then four todos with Edit and Delete buttons, two of them checked off."
order: 2
---

A proof-of-concept "super monolith": a Vue 3 single-page app built and served straight out of a Spring Boot backend. A second Actix (Rust) server, still a work in progress, implements the same CRUD API so the two can be benchmarked against each other.

## Why

To strengthen my web architecture skills. I'm comfortable with Spring controllers and solid in JavaScript, and Rust is new territory, so building the same thing twice was the most direct way to compare them.

## What's in it

- **One API contract, two backends.** Spring (Maven, Java 17) and Actix serve the same endpoints.
- **PostgreSQL with Flyway migrations**, plus JWT auth configured through environment variables.
- **A single build.** One script builds the Vue app and drops it into Spring's static folder.
- **Design-first docs.** The general design, each backend, and the benchmark rules for comparing Rust and Java are each documented separately.
