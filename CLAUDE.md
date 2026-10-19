# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Status

This is a pre-code project. Only the spec exists so far. **`PROJECT.md` is the source of truth** for scope, MVP features, the rating method and the matching formula. Read it before starting any work, and update it when a decision changes. Once code exists, add build, test and run commands here.

## What the app does

A web app for basketball coaches and club managers. The coach rates 9 "need" parameters from 1 to 5 (physical, shooting, ball handling, passing & playmaking, defense, rebounding, basketball IQ, mental & competitive, team contribution) and sets filters (position, age, height, league). The app recommends players from the **EuroLeague** and the **Israeli league**. Each player page shows ratings, an AI-written fit explanation, and upcoming games with an `.ics` "Add to calendar" button.

## Planned architecture

```
[Python collector] --scheduled--> [DB] <-- [Next.js app] --> [Claude API]
```

- **The collector is offline and separate from the web app.** It pulls data from the EuroLeague API and basket.co.il, computes the 1–5 ratings, and writes players, stats, ratings and games to the DB. The web app never scrapes at request time.
- **Ratings are percentiles within the same league and position**, bucketed into 1–5, with a minimum minutes or games threshold. IQ, mental and team contribution are rough proxies and must be marked "estimated" in the UI.
- **Matching only penalizes shortfalls:** `gap = max(0, need − rating)` per parameter. The score is weighted by need importance, and exceeding a need is never penalized.
- **The Claude API is used only for the per-player "why he fits" text**, not for search or scoring.

Stack: Next.js (TypeScript), Auth.js login with saved searches and shortlists, SQLite for development and Postgres later, a Python collector (requests + BeautifulSoup), and the Claude API.

## Data source constraints

basketball-reference.com and basketball.realgm.com forbid scraping in their ToS. eurobasket.com and skouted.ai are paid or paywalled. None of these are MVP sources, so don't add scrapers for them without checking with the user. apps.apple.com is not a data source.

## Out of scope for MVP

Roster-based team fit, other leagues, email alerts, player accounts, mobile, and messaging. See `PROJECT.md` for the v2 list.
