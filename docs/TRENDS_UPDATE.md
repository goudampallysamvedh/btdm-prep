# Weekly trends update guide

The Industry Trends section (`src/data/trends.ts`) is refreshed once a week. Follow these rules whether a person or the scheduled job does it.

## What to update
1. For each trend in `TRENDS`, look for newer data from the same or better sources (official reports, trade associations, major research firms, reputable trade press). Prefer primary sources (PLMA, NRF, Adobe, eMarketer, Coresight, Piper Sandler/DECA, ThredUp, government data).
2. Replace a stat only when the new figure is more recent **and** you opened the source page and confirmed the number. Update `asOf` and the matching entry in `sources`.
3. If nothing changed for a trend, leave it alone.
4. You may add **at most one** new trend per week if a clearly important retail development appears (it must matter to a high school buying and merchandising case). Keep the list at 20 or fewer; retire the least relevant one if needed, but never remove a trend listed in any case's `trends` array in `src/data/cases.ts`.
5. Keep each trend's `sayIt` line consistent with its current numbers.
6. Set `TRENDS_CHECKED` to today's date (YYYY-MM-DD) every run, even if no stats changed.

## Rules
- Every stat must point to a source with an `https://` URL that you actually opened.
- Label forecasts as forecasts. Use "about" for rounded numbers.
- Write in plain language for high school students. No hype.
- Never copy paragraphs from articles; summarize in your own words. Short facts and numbers only.
- Do not change anything outside `src/data/trends.ts` and `docs/TRENDS_LOG.md`.
- `TREND_CARDS` and `TREND_QUESTIONS` must stay conceptual (no volatile numbers).

## Checks before publishing
Run `npm test` and `npm run build`. Both must pass. Then commit with the message `Weekly trends update YYYY-MM-DD` and push to `main`; GitHub Actions redeploys the site.

Append a short entry to `docs/TRENDS_LOG.md`: the date, what changed (or "no changes"), and the sources used.
