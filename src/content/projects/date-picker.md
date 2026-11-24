---
title: Date Picker
summary: A date picker web component in Lit, revisited years later to fix its bugs and make it work with a keyboard, a screen reader and a form.
repo: https://github.com/ClarkGH/date-picker
stack: [TypeScript, Lit, Popper, Vitest, Playwright, axe]
status: done
image: ../../assets/projects/date-picker.png
imageAlt: "The picker open in dark mode under a field reading 11/03/2026: a November 2026 calendar with the 3rd filled in blue as the selected day, a white focus outline on the 4th, and the 24th in bold as today."
order: 6
---

I built this in 2023 as a proof of concept: a date picker that looks the same everywhere, unlike the built-in date input, which changes with every browser. Coming back to it, I found it didn't build, and picking a date from the calendar erased it a moment later. Date pickers look like a weekend project. They're more of a lesson in humility.

## What's in it

- **Keyboard support** following the WAI-ARIA date picker pattern: arrow keys, Page Up and Page Down, Home and End, and Escape, with focus going back where it came from.
- **Works in forms.** It submits, validates, resets and disables like a native input, which an input inside a web component doesn't do on its own.
- **Forgiving input, specific errors.** 4/3/2023 becomes 04/03/2023, and a bad date says what's wrong, like "February 2023 has 28 days."
- **Checked in a real browser.** Playwright and axe check it against WCAG 2.2 AA in light and dark mode, plus what a fake DOM can't see: focus rings, 400% zoom, and the page not jumping when the calendar opens.
- **Date math that survives daylight saving time.** The tests run in São Paulo's time zone, where midnight once didn't exist.

The repo also has a write-up of [the problems most hand-built date pickers run into](https://github.com/ClarkGH/date-picker/blob/main/docs/pitfalls.md), and which ones this one ran into first.

## Status

Done for now. It still needs testing with real screen readers, and the typed format is US-only (MM/DD/YYYY), whatever the locale.
