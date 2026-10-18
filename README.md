# Sell-Through: BTDM Prep

**Live app:** https://goudampallysamvedh.github.io/btdm-prep/

An offline study app for DECA **Buying and Merchandising Team Decision Making (BTDM)**: an exam trainer with progress reports, Leitner flashcards, a retail math lab, buying & merchandising lessons, a visual guide, industry trends, a team case simulator, and partner sync. It installs to a phone's home screen and works without internet after the first load. No accounts, no server, no AI.

Built with Vite, React, TypeScript, Tailwind CSS v4, and vite-plugin-pwa. Progress is saved in the browser (IndexedDB).

## Run it

You need [Node.js](https://nodejs.org) 20 or newer.

```bash
npm install
npm run dev        # http://localhost:5173/btdm-prep/
npm test           # unit + content tests (Vitest)
npm run build      # type-check + production build into dist/
npm run e2e        # browser checks at 390px and desktop, light/dark, offline (run npm run build first)
npm run check:videos   # confirm every video link still works (needs internet)
```

To run the browser checks against the live site instead of a local build, set `E2E_URL` (PowerShell: `$env:E2E_URL='https://goudampallysamvedh.github.io/btdm-prep/'; npm run e2e`).

The first time you run `npm run e2e`, install the test browser with `npx playwright install chromium`.

## Update content

All content lives in `src/data/` as typed TypeScript. Edit, run `npm test`, and the content tests will catch broken tags, duplicate IDs, or invalid answers.

| What | File | Notes |
|---|---|---|
| Exam blueprint, study guide, traps | `areas.ts` | Each term's `id` is a topic used for progress tracking. |
| Exam questions | `questions/tier1.ts`, `tier2.ts`, `tier3.ts`, `kit.ts` | Use `Q(id, pi, topic, stem, correct, [3 wrong], explanation)`. Write the correct answer first; the app shuffles options. The PI prefix must match the topic's area. Mark calculation questions `{ math: true }` and add a recomputation to `mathQuestions.test.ts`. |
| Flashcards | `flashcards.ts` | `[area, topic, front, back]` rows. |
| Lessons | `lessons.ts` | Sections are HTML strings; `checks` are the quick-check questions. |
| Trends | `trends.ts` | Update `data`, `sources`, and `asOf` when numbers change. Label forecasts as forecasts. |
| Cases | `cases.ts` | Five PIs, three competencies, two standard judge questions. Tests confirm the rubric totals 100. |
| Judge questions | `judgeQuestions.ts` | |
| Videos | `videos.ts` | Run `npm run check:videos` after editing. |
| BTDM rules & rubric | `playbook.ts` | Re-check against the DECA Guide each season. |

Never paste DECA's or MBA Research's copyrighted exam questions or case text into the app. Write original material.

## Deploy (GitHub Pages)

The workflow in `.github/workflows/deploy.yml` tests, builds, and publishes on every push to `main`.

One-time setup:

1. Create a GitHub repository named `btdm-prep` and push this folder to it.
2. In the repository, open **Settings → Pages** and set **Source** to **GitHub Actions** (or run `gh api -X POST repos/OWNER/btdm-prep/pages -f build_type=workflow`).
3. Push to `main`. The site appears at `https://OWNER.github.io/btdm-prep/`.

If you rename the repository, the workflow sets the base path automatically. For local builds with a different path, run `BASE_PATH=/new-name/ npm run build`.

To redeploy after editing content, commit and push to `main`. Installed apps show an **Update** banner the next time they open online.

## Install on a phone

**iPhone (Safari):** open the site → tap **Share** → **Add to Home Screen** → **Add**.
**Android (Chrome):** open the site → tap **⋮** → **Install app** (or **Add to Home screen**).

Open it once while online. After that it works offline.

## Sync

Progress stays on each device and moves with copy-and-paste codes. **Sync → My devices** copies all of your progress to your other devices and combines it without losing anything. **Sync → Partner** shares case plans, case scores, your exam estimate, streak, and what you need to work on; the **Partner** page shows your partner's progress. A backup file is under My devices.

**Live updates** (Sync → Partner): one partner creates a live link, then it is pasted on every other device (your partner's and your own), and each device picks whose it is. After that, each app sends its partner summary whenever progress changes, through [ntfy.sh](https://ntfy.sh) (a free relay, no account). Each update is encrypted on the phone with AES-GCM using a key derived from the shared link, and the relay channel name is derived from it too, so the relay can't read or fake updates (`src/lib/live.ts`). Only the summary is sent, never full history.

## Study helper (no AI)

The **study helper** (the question-mark icon on phones, **Ask for help** on larger screens) answers DECA and BTDM questions from the app's own content: the study guide, PI guide, flashcards, lessons, math tools, diagrams, trends, and BTDM rules (`src/lib/helper.ts`). Replies can include a flip card, a diagram, a mini calculator, a three-question quiz, a progress chart, and links to the full page. It declines off-topic questions, won't pick answers to pasted test questions, and is hidden on the mock exam and practice screens.

## Optional AI judge (not enabled)

`src/lib/judge.ts` defines a `JudgeProvider` interface. Today only self-scoring is active. To add an AI judge later, deploy a small server function that holds the API key as a secret and calls the model, then build with `VITE_JUDGE_ENDPOINT=https://your-function-url`. **Never put an API key in this app's code or environment variables that start with `VITE_`**: everything in the client bundle is public.

## Sources

BTDM rules come from DECA's 2026–27 Team Decision Making guidelines and the published BTDM sample events (links in the app's Playbook). Sample-exam PDFs were used only to tally topics and the blueprint; no questions were copied. Not affiliated with DECA Inc. or MBA Research.
