---
title: SpringVue
summary: A todo app being built twice, in Java and in Rust, to compare them fairly. The Java version (Spring Boot and Vue 3) got a security review first.
repo: https://github.com/ClarkGH/springvue
stack: [Java, Spring Boot, Vue 3, Pinia, PostgreSQL, Rust, Actix]
status: active
image: ../../assets/projects/springvue.png
imageAlt: "The Vue todo app: a box for adding todos, then four todos with Edit and Delete buttons, two of them checked off."
order: 4
---

A todo list app: you log in, then add, edit, check off and delete your own todos. The Vue 3 front end is served straight out of a Java backend. It started as a small Java app and is turning into a comparison: the same app built again in Rust, and both measured the same way.

## Why

To strengthen my web architecture skills. I'm comfortable with Spring controllers and solid in JavaScript, so a Java CRUD app was familiar ground. Rust is new territory, so the next step is building the same API again in Actix and seeing how the two compare.

## Status

The Java app works. Before measuring anything, I reviewed it the way an attacker would and found 12 problems, 3 of them serious. Turns out past me left a few gaps. The fixes come first, so the comparison measures the fixed code.

The Rust version is barely started, and the comparison is planned but not run yet.

## Technical details

- **The Java app.** Spring Boot with PostgreSQL and Flyway migrations, JWT login, and one build script that drops the Vue app into Spring's static folder.
- **The security review.** 12 findings, 3 of them high, each confirmed by a probe or by reading the code. One example: the login answered in about 6 ms for made-up usernames and about 90 ms for real ones, which tells an attacker which accounts exist.
- **The Rust twin.** Actix answers a single hello-world route for now. It'll implement the same API contract, with the review's findings built in from the start.
- **A fair comparison.** The rules are written down (same schema, same data, same work per request), along with a scenario for each endpoint and a mixed, read-heavy workload.
