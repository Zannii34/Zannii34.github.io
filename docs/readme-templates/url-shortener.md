# URL Shortener with Analytics

A Flask URL shortener that tracks click-throughs, referrers and user agents, and shows a Chart.js dashboard of the last 30 days of activity.

## The problem

Public link shorteners hand your URLs to a third party and either hide analytics behind a paywall or do not track them at all. I wanted a self-hostable version where the data stays mine.

## What it does

- Create short links via a web form or REST API
- Track every click with timestamp, referrer, and user agent
- Dashboard shows 30-day click trends, top referrers, and top links
- REST API for programmatic link creation

## Technical decisions

- Flask over FastAPI: the app is small and synchronous. FastAPI async benefits do not apply to a SQLite-backed redirect.
- SQLAlchemy: schemas will evolve. Wanted migrations from day one.
- SQLite + WAL: read-heavy, single-writer. Perfect fit.
- Chart.js over D3: dashboard has 3 charts. D3 would be overkill.

## What would I change at scale?

- Move to Postgres once the click table hits ~10M rows
- Precompute daily aggregates into a summary table
- Put a CDN in front of the redirect endpoint

## What I learned

Analytics sounds simple but the hard part is deciding what to precompute. Querying raw click rows for a dashboard is fine at 1,000 rows and awful at 1,000,000. The fix is a nightly rollup.

## License

MIT
