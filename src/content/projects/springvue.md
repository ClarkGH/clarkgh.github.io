---
title: springvue
summary: A Java CRUD app with a Vue front end, now getting a security review and a Rust twin to compare it against.
repo: https://github.com/ClarkGH/springvue
stack: [Java, Spring Boot, Vue 3, Pinia, PostgreSQL, Rust, Actix]
status: active
image: ../../assets/projects/springvue.png
imageAlt: "The Vue todo app: a box for adding todos, then four todos with Edit and Delete buttons, two of them checked off."
order: 2
---

A plain CRUD app: a todo list per user, with a Vue 3 single-page app built and served straight out of a Spring Boot backend. It started as a small Java app and is turning into a comparison project.

## Why

To strengthen my web architecture skills. I'm comfortable with Spring controllers and solid in JavaScript, so a Java CRUD app was familiar ground. Rust is new territory, so the next step is building the same API again in Actix and seeing how the two compare.

## Where it's at

- **The Java app works.** Spring Boot with PostgreSQL and Flyway migrations, JWT login, and one build script that drops the Vue app into Spring's static folder.
- **A security review came first.** Before benchmarking anything, I reviewed the Java side as if it were going to production. Turns out past me left a few gaps, like a login that takes longer for real usernames than for made-up ones. The fixes land before the benchmarks, so the numbers measure the fixed code.
- **The Rust twin is barely started.** Actix answers a single hello-world route for now. It'll implement the same API contract, with the review's findings built in from the start.
- **Benchmarks are planned, not run.** The rules for a fair comparison (same schema, same data, same work per request) are written down. The numbers come later.
