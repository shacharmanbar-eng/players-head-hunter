# Players Head Hunter — Project Definition (v0.2)

## Goal
A web app that helps basketball **club managers and coaches** find a player who fills a specific gap in their team.
The coach describes what the team needs, and the app recommends players who match those needs and would make the team better.

## Users
- **Club manager / coach**: logs in, defines needs, reviews recommendations, saves searches and shortlists, follows a player's upcoming games.

## MVP leagues
- **EuroLeague** (public API for stats and schedules)
- **Israeli league** (basket.co.il for stats and schedules)

## Core flow (MVP)
1. The coach **logs in**.
2. The coach rates each **need** from 1 to 5 (1 = not important, 5 = critical):
   | # | Parameter |
   |---|-----------|
   | 1 | Physical attributes |
   | 2 | Shooting |
   | 3 | Ball handling |
   | 4 | Passing & playmaking |
   | 5 | Defense |
   | 6 | Rebounding |
   | 7 | Basketball IQ |
   | 8 | Mental & competitive qualities |
   | 9 | Team contribution |
3. The coach sets **filters**: position (PG/SG/SF/PF/C), age range, height range, league.
4. The app scores the players that pass the filters against the needs profile and returns the **top recommendations**.
5. For each recommended player, it shows:
   - Basic info: name, age, position, height, current team, league
   - A 1–5 rating for each of the 9 parameters, next to what the coach asked for (e.g., a radar chart)
   - A short AI-written explanation of why this player fits
   - **Upcoming games** listed on screen, with an **"Add to calendar"** button (.ics file for Google or Outlook)
6. The coach can **save the search** (needs + filters) and **shortlist** players.

## Architecture
```
[Python data collector] --(scheduled, e.g. daily)--> [Database] <-- [Next.js web app] --> [Claude API]
  EuroLeague API, basket.co.il      players, stats,        search, ratings,       "why he fits"
                                    ratings, games         login, saved searches   explanations
```
- **Data is collected ahead of time** and not searched live on every request, so the app stays fast and reliable.
- **Ratings (1–5)** are computed by the collector and stored in the DB.

## Tech stack
| Layer | Choice |
|---|---|
| Web app (frontend + API) | Next.js (TypeScript) |
| Database | SQLite for development, Postgres later |
| Auth | NextAuth / Auth.js (email or Google login) |
| Data collector | Python (requests + BeautifulSoup, EuroLeague API) |
| AI explanations | Claude API |
| Calendar | Generated .ics files |

## Data sources
| Source | Use | Status |
|---|---|---|
| EuroLeague API | Stats, rosters, schedules | **MVP** |
| basket.co.il | Israeli league stats, rosters, schedules | **MVP** |
| thebasketballatlas.com | Player archetypes / skill profiles | Later, may enrich ratings |
| 2kdb.net | NBA 2K ratings | Later, if NBA is added |
| basketball-reference.com, basketball.realgm.com | Stats | Later. ToS forbid scraping |
| eurobasket.com, skouted.ai | Scouting data | Later. Paid or paywalled |

## Turning stats into 1–5 ratings
Each player is compared with others **in the same league and position**. Percentiles are mapped to 1–5 (e.g., <20% → 1, 20–40% → 2, …, >80% → 5).
Players need a minimum number of minutes or games to be rated.
- **Shooting:** FG%, 3P%, FT%, TS%, 3PA volume
- **Ball handling:** TOV% (inverted), usage, AST/TOV
- **Passing & playmaking:** assists per 36, AST/TOV
- **Defense:** steals, blocks, defensive rating / PIR-based proxies
- **Rebounding:** offensive, defensive and total rebounds per 36
- **Physical:** height, weight, age
- **Basketball IQ / Mental / Team contribution:** rough proxies such as +/-, AST/TOV, fouls, games started and minutes trend. These are flagged in the UI as "estimated"

## Matching
- For each parameter: `gap = max(0, need − player_rating)`. A player who meets or exceeds a need isn't penalized.
- `score = 100 − weighted sum of gaps`, where higher needs get a higher weight.
- Ties are broken by overall efficiency (e.g., PIR).

## Out of scope for MVP (v2+)
- **Team fit** based on the current roster (load the coach's team, find its weak spots, boost players who cover them)
- More leagues (NBA, Spain, Turkey, etc.)
- Email notifications for upcoming games
- Player-side accounts
- Mobile app
- Messaging or contacting agents

## Next steps
1. Check what the EuroLeague API and basket.co.il actually provide (fields, schedules, access)
2. Design the DB schema (players, teams, games, stats, ratings, users, saved searches)
3. Build the collector and the rating calculation
4. Build the Next.js app: login → needs form → results → player page
